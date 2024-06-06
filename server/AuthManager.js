const crypto = require('crypto');

class AuthManager {
  constructor(password, username, apiKey) {
    this.hashedPassword = this.hash(password);
    this.hashedUsername = this.hash(username);
    this.hashApiKey = this.hash(apiKey);
  }


  hash(text) {
    return crypto.createHash('md5').update(text).digest('hex')
  }

  extractAndTrimUrlParams(url) {
    // S�parer les diff�rents param�tres de l'URL
    const params = url.split('?')[1].split('&');

    // Cr�er un objet pour stocker les valeurs des param�tres
    const paramsObj = {};

    // Parcourir chaque param�tre et l'ajouter � l'objet en supprimant les espaces
    for (const param of params) {
      const [key, value] = param.split('=');
      paramsObj[key] = value.trim();
    }

    // Retourner l'objet contenant les valeurs des param�tres sans espaces
    return paramsObj;
  }

  checkCredentials(hashedPassword, hashedUsername) {
    return hashedPassword === this.hashedPassword && hashedUsername === this.hashedUsername;
  }

  checkAuth(url) {
    try {
      const extracted = this.extractAndTrimUrlParams(url);
      return this.checkCredentials(extracted.password, extracted.username);
    } catch (error) {
      console.log(`${url} failed`);
      return false;
    }
  }
 
  middleware = (req, res, next) => {
    const reject = () => {
      res.setHeader("WWW-Authenticate", "Basic");
      res.sendStatus(401);
    };
  
    const authorization = req.headers.authorization;
  
    if (!authorization) {
      return reject();
    }
  
    const [username, password] = Buffer.from(
      authorization.replace("Basic ", ""),
      "base64"
    )
      .toString()
      .split(":");
  
  
    if (!this.checkCredentials(this.hash(password),this.hash(username))) {
      return reject();
    }
  
    next(); // Authentification r�ussie, passez au prochain middleware
  };
}



module.exports = AuthManager