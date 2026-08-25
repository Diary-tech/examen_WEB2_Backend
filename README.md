# examen_WEB2_Backend

Après que vous avez cloné ce dépôt, créez votre propre fichier .env et configurez le en prenant exemple sur le .env.example.
Ensuite allez dans le terminal de votre machine pour créer une base de donnée dont le nom devrait être similaire au  DB_NAME de votre .env .
Maintenant éxécutez ces commandes par suite :
    - npm install (pour isntaller les dépendances nécesaires)
    - psql -U votre_utilisateur -d votre_base -f ./database/schema.sql (celà va éxécutez les requêtes sql dans ce fichier dans votre base)
    - npm run seed:admin (pour la création d'un administrateur si il n'y en a pas encore)
    - npm run dev (pour lancer le projet)