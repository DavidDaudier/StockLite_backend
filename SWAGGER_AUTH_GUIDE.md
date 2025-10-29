# Guide d'authentification Swagger - StockLite API

## Problème : Erreur 401 Unauthorized

Lorsque vous essayez d'accéder aux endpoints protégés (comme créer un produit), vous obtenez une erreur 401 car vous n'êtes pas authentifié.

## Solution : S'authentifier avec JWT

### Étape 1 : Créer un compte administrateur

1. Ouvrez Swagger UI : http://localhost:3000/api/docs
2. Allez dans la section **Auth**
3. Cliquez sur `POST /api/auth/register`
4. Cliquez sur **"Try it out"**
5. Modifiez le body avec vos informations :

```json
{
  "username": "admin",
  "email": "admin@stocklite.com",
  "password": "Admin123!",
  "fullName": "Admin StockLite",
  "role": "admin"
}
```

6. Cliquez sur **"Execute"**
7. **Copiez le token JWT** dans la réponse (exemple ci-dessous) :

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "username": "admin",
    "email": "admin@stocklite.com",
    "role": "admin"
  }
}
```

### Étape 2 : S'authentifier dans Swagger

1. En haut à droite de la page Swagger, cliquez sur le bouton **"Authorize"** 🔒
2. Dans le champ qui s'ouvre, collez **UNIQUEMENT le token** (pas "Bearer", juste le token)
3. Cliquez sur **"Authorize"**
4. Cliquez sur **"Close"**

### Étape 3 : Tester l'ajout d'un produit

1. Allez dans la section **Products**
2. Cliquez sur `POST /api/products`
3. Cliquez sur **"Try it out"**
4. Modifiez le body :

```json
{
  "name": "iPhone 14 Pro",
  "description": "Smartphone haut de gamme",
  "sku": "IP14P-256-BLK",
  "barcode": "1234567890123",
  "price": 1299.99,
  "costPrice": 899.99,
  "quantity": 50,
  "minStock": 10,
  "category": "Smartphones",
  "brand": "Apple",
  "model": "iPhone 14 Pro"
}
```

5. Cliquez sur **"Execute"**
6. Vous devriez maintenant voir une réponse 201 Created au lieu de 401 Unauthorized

## Alternative : Se connecter avec un compte existant

Si vous avez déjà créé un compte, utilisez `POST /api/auth/login` :

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Puis suivez les étapes 2 et 3 ci-dessus.

## Notes importantes

- Le token JWT est valide pendant une durée limitée (vérifiez votre configuration JWT)
- Vous devez être **admin** pour créer, modifier ou supprimer des produits
- Les **sellers** peuvent uniquement voir les produits et créer des ventes
- Le token est persistant dans Swagger (il reste même après rechargement de la page)

## Déconnexion

Pour vous déconnecter dans Swagger :
1. Cliquez sur **"Authorize"**
2. Cliquez sur **"Logout"**
