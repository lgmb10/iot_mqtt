# Installation du projet

## Serveur Mosquitto

https://mosquitto.org/download/

### Mac OS 

```
brew install mosquitto
brew services start mosquitto 
```

### Windows

Téléchargez et lancez l'installateur, une fois installé le service se lance automatiquement avec Windows.  
Si ce n'est pas le cas ouvrez l'application Service, recherchez le service Mosquitto Broker et faites clique-droit &rarr; Démarrer

## Chat

```
npm i
node chat.js
```
Vous pouvez lancer autant d'instance du chat que vous souhaitez.

# Information du projet

Technos utilisés : nodeJS

Les informations relatives à l'utilisation du chat et à la navigation dans le forum de discussion sont indiquées lorsque vous lancez une instance du chat.

### Fonctionnalités mise en place :
- login avec username (pas de user unique mis en place)
- chat général
- Possibilité de créer un canal de discussion avec un nom
- Inviter des utilisateurs dans le canal de discussion où l'on se trouve
- Un utilisateur peut rejoindre un canal, quitter un canal et discuter dans un canalavec les autres utilisateurs du canal.
- Possibilité de discuter en one to one avec un autre utilisateur

Lorsque vous êtes dans un canal, tout le monde peut le rejoindre, vous pouvez inviter un utilisateur à le rejoindre, passer directement en message privé avec la dernière personne qui a écrit dans le canal


