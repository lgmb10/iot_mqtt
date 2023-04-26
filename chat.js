const mqtt = require('mqtt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let client;
let username;
let currentChannel;
let lastMessageUser = false;
let invite = false;

// Connexion à un canal
function joinChannel(channel) {
        client.subscribe(channel);
        client.subscribe(`one-to-one/${username}`);
        console.log(`Vous avez rejoint le canal ${channel}`);

    currentChannel = channel;
}

// Affichage menu
function showMenu() {
    console.log(`──────────────────────────────\nBienvenue, ${username}!\n──────────────────────────────`);
    console.log('1. Rejoindre un canal existant ou en créer un nouveau');
    console.log('2. Chatter en one to one avec un utilisateur\n──────────────────────────────');
    console.log('Lorsque vous êtes dans un canal tapez :\n' +
        ':exit pour le quitter et revenir au menu\n' +
        ':invite pour inviter un utilisateur à rejoindre ce canal\n' +
        ':accept pour accepter une invitation\n' +
        ':private pour entrer en message privé avec la dernière personne qui a envoyé un message dans le canal\n──────────────────────────────');
    rl.question('Entrez votre choix : ', (choice) => {
        switch (choice) {
            case '1':
                rl.question('──────────────────────────────\nEntrez le nom du canal que vous souhaitez rejoindre ou créer (laissez vide pour rejoindre le canal général) : ', (channel) => {
                    if (!channel) {
                        joinChannel('general');
                    } else {
                        joinChannel(channel);
                    }
                });
                break;
            case '2':
                rl.question('Entrez le nom de l\'utilisateur avec qui vous souhaitez chatter en one to one : ', (recipient) => {
                    const channel = `one-to-one/${recipient}`;
                    joinChannel(channel);
                    rl.on('line', (input) => {
                        if (input === ':exit') {
                            client.unsubscribe(channel);
                            console.log(`Vous avez quitté le canal ${channel}`);
                            currentChannel = null;
                            showMenu();
                        }
                    });
                });
                break;
            default:
                console.log('Choix invalide');
                showMenu();
                break;
        }
    });
}

// Connexion au broker MQTT
client = mqtt.connect('mqtt://localhost');

// Si connexion réussi au MQTT
client.on('connect', () => {
    rl.question('Entrez votre nom d\'utilisateur : ', (name) => {
        username = name;
        showMenu();
    });
});

// Gestion de la réception de messages
client.on('message', (topic, message) => {
    console.log(`──────────────────────────────\nCanal: ${topic} | ${message.toString()}`);
    try {
        lastMessageUser = message.toString().split(' ')[1];
        if(lastMessageUser.includes("Private")) lastMessageUser = message.toString().split(' ')[2];
    }catch (e){
    }
    if(message.includes('INVITATION')){
        invite = message.toString().split(' ')[8];
        console.log(invite);
    }
});

// Gestion des erreurs de connexion
client.on('error', (error) => {
    console.log(`Erreur de connexion : ${error}`);
});

// Saisie dans la console
rl.on('line', (input) => {
    if (input === ':exit') {
        if (currentChannel) {
            client.unsubscribe(currentChannel);
            console.log(`Vous avez quitté le canal ${currentChannel}`);
            currentChannel = null;
        } else {
            console.log('Vous n\'êtes actuellement sur aucun canal');
        }
        showMenu();
    }else if(input === ':invite'){
        rl.question('Entrez le nom de l\'utilisateur avec que vous souhaitez inviter ici : ', (userToInvite) => {
            if(!userToInvite){
                console.log("Vous devez saisir un nom d'utilisateur, veuillez saisir :invite pour recommencer");
            }else{
                client.publish(`one-to-one/${userToInvite}`, `\n[INVITATION] ${username} Vous invite à rejoindre le canal ${currentChannel} \nSaisissez :accept pour le rejoindre\n──────────────────────────────`);
            }
        });
    }else if(input === ':accept'){
        if(invite !== false){
            client.unsubscribe(currentChannel);
            currentChannel = invite;
            invite = false;
            joinChannel(currentChannel);
        }else{
            console.log("vous n'avez pas été invité à rejoindre un canal ou vous êtes déjà dans le canal dans lequel on vous a invité");
        }
    } else if(input === ':private'){
        if(lastMessageUser === username){
            console.log("vous ne pouvez pas discuter avec vous même");
        }else if(lastMessageUser !== false) {
            client.unsubscribe(currentChannel);
            console.log(lastMessageUser);
            joinChannel(`one-to-one/${lastMessageUser}`);
            console.log(`vous communiquez maintenant directement avec ${lastMessageUser}`);
        }else{
            console.log("il n'y a pas d'utilisateur précédent avec qui vous pouvez communiquer en privé")
        }


    }else if (currentChannel) {
        if (currentChannel.startsWith('one-to-one/')) {
            client.publish(currentChannel, `Expéditeur: [Private] ${username} \nMessage:  ${input}\n──────────────────────────────`);
        } else {
            client.publish(currentChannel, `Expéditeur: ${username} \nMessage: ${input}\n──────────────────────────────`);
        }
    } else {
        console.log('Vous devez d\'abord rejoindre un canal');
    }
});

