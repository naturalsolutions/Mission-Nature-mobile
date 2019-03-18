# MissionNature

## Environnement de développement

Les dépendances JavaScript (bibliothèques, ...) sont satisfaites par npm.


Le code Javascript est organisé en modules selon la syntaxe CommonJS. Il doit donc être compilé avec Browserify afin d'être exploitable par le navigateur.


Cette compilation des fichiers est automatisée avec Grunt. Grunt automatise aussi diverses autres tâches.


Puisqu'il s'agit d'un projet mobile basé sur Cordova, cette tâche grunt a été attachée au hook before-prepare de Cordova. Ainsi, pour tester l'application sur un terminal, vous n'avez rien de plus à faire que :
```
cordova run <platform>
```
Pendant le développement, pour plus de facilité, vous pouvez tester l'application dans le navigateur :
```
grunt dev
  ```
Note : la tâche dev ouvre l'appli dans votre navigateur avec watch + livereload.

Merci de documenter brièvement ici les outils que vous ajouterez au fur et à mesure du développement.

## Installer l'environnement de développement

Créer une copie locale de la base de code :
```
git clone <depot> .
```
Installer les diverses dépendances du projet :
```
npm install -g cordova grunt-cli
npm install
cordova plugin restore --experimental
```
Enfin, activer la plateforme de test qui vous convient (android ou ios) :

cordova platform add android
### Gestion des plugins Cordova

Merci d'ajouter les plugins au config.xml pour qu'ils puissent être installé par les autres développeurs de manière facile et cohérente.

Pour cela, utilisez la CLI :
```
cordova plugin add org.apache.cordova.plugin-name@x.y.z
cordova plugin save --experimental
```
La seconde ligne ajoute une référence à ce plugin dans congig.xml. Les autres développeurs pourront se mettre à jour en tapant simplement :
```
cordova plugin restore --experimental
Référence: http://stackoverflow.com/a/25105731
```
Note : pour éviter les mauvaises surprises, il est important de fixer les versions des plugins. On n'installe pas le plugin foobar, jamais. On peut en revanche installer le plugin foobar@x.y.z, pas de problème.

### Gestion des dépendances Javascript

Utiliser npm pour inclure dans le projet des dépendances Javascript. Merci de différencier les dépendances de développement et globales :
```
npm install jquery --save
```
ou :
```
npm install grunt --save-dev
```
Note : Comme pour les plugins et pour les mêmes raisons, il est important de fixer les versions des dépendances Javascript. Avec l'option --save, npm fixe automatiquement le numéro de version.
