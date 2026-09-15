install Node.js 24.17.0 or newer.

Open a terminal inside this folder.
(ctrl + ` inside of vsc or in file explorer, hit the file url and type "cmd" and hit enter)

fresh install:
npm install discord.js dotenv luxon

Open .env
Fill in TOKEN, CLIENT_ID, and GUILD_ID.

deploy the commands:
npm run deploy

start using:
npm start

run these to setup things:

/setchannel -- this is where the patrol announcement goes
/setnotifiedrole -- only ppl w "Administrator" permission can use this, set ur patrol notified role
/authorizerole -- only ppl w "Administrator" permission can use this, allows roles to use the patrol command (patrol permissions)
