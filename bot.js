var Discord = require("discord.js");
var fs = require("fs");
var ideone = require("ideone-npm");
var request = require("sync-request");

var bot = new Discord.Client();

var prefix = process.argv[2] || ";";

fs.readFile("token.txt", {encoding: 'utf8'}, (err, data) => {
    if (err)
        process.exit(console.log("Can't read token.txt: "+err) && 1 || 1);

    runBot(data)
});

var usage = [
    "\n0x19D u2age:",
    "```",
    `${prefix}help: show thii2 help me22age`,
    `${prefix}join: send a link to make 0x19D join your server`,
    `${prefix}compile [language] [code]: compiile code`,
    `${prefix}languages: 2how language lii2t\n`,
    `${prefix}comp ii2 an aliias to ${prefix}compile`,
    `you can 2end a fiile wiith ${prefix}comp [language] a2 comment iin2tead of code`,
    `${prefix}langs ii2 an aliias to ${prefix}languages`,
    "```"
].join('\n');

function runBot(token) {
    var compile = ideone('b11bf50b8a391d4e8560e97fd9d63460');
    var langs = {};
    compile.languageSupport( (languages) => {
        Object.keys(languages).forEach( (v) => {
            //support different cases
            langs[v.toLowerCase()] = v;
        });
    });
    var inviteLink = "https://discordapp.com/oauth2/authorize?client_id=215872988455632896&scope=bot&permissions=0";
    
    bot.loginWithToken(token, (err, token) => {
        if (err) {
            console.log("Logging error: " + err);
            process.exit(1);
        }
        console.log("Logging succesful!");
    });

    bot.on("ready", () => {
        console.log("Bot ready!");
    });

    bot.on("message", (msg) => {        
        if (msg.content.startsWith(prefix+"comp") || msg.content.startsWith(prefix+"compile")) {
            var content = msg.content
                .substring(prefix.length) //remove prefix
                .replace(/^comp(ile)? */i, "") //remove command
            ;
            
            if (content === "")
                msg.channel.sendMessage(msg.author.mention()+usage);
            
            else if (msg.content.startsWith(prefix+"comp ") || msg.content.startsWith(prefix+"compile ")) {
                //;comp [something]
                var cmd = content.split(" ");
                if (!msg.attachments.length && cmd.length < 2)
                    return msg.channel.sendMessage(msg.author.mention()+usage);
                
                var lang = langs[cmd[0].toLowerCase()];
                if (!lang)
                    return msg.channel.sendMessage(`language '${cmd[0]}' ii2nt avaiilable`);
                
                var code;
                
                if (msg.attachments.length) {
                    //use file instead
                    var res = request('GET', msg.attachments[0].url); //download attachment
                    code = res.getBody("utf8");
                }
                
                code = code || content.substring(lang.length+1);
               
                //Source Code to be compiled remotely
                var compile = ideone('b11bf50b8a391d4e8560e97fd9d63460');

                //Input for the program
                var testCases = '';

                //'Run' routine compiles the code and return the answer object
                msg.channel.sendMessage("reciieved, compiiliing...")
                console.log(`recieved code '${code}'`)
                compile.Run(code, lang, testCases, (answer, error) => {
                    if (error)
                        return msg.reply("there wa2 an error with your reque2t: " + error)
                        
                    
                    var resp = msg.author.mention();
                    
                    if (answer.output)
                        resp += `\nStdout: \`\`\`\n${answer.output}\`\`\``;
                    
                    if (answer.stderr)
                        resp += `\nStderr: \`\`\`\n${answer.stderr}\`\`\``;
                        
                    if (!answer.stderr && !answer.output)
                        resp += "\n`no output`"
                    
                    console.log(resp);
                    
                    msg.channel.sendMessage(resp);
                });

            }
        } else if ((msg.content === prefix+"langs") || (msg.content === prefix+"languages")) {
            var resp = "`"+Object.keys(langs).join(", ")+"`";
            msg.channel.sendMessage("check your pm2 " + msg.author.mention());
            msg.author.sendMessage(resp);
            
        } else if (msg.content.startsWith(prefix+"help")) {
            msg.channel.sendMessage(msg.author.mention()+usage);
            
        } else if (msg.content.startsWith(prefix+"join")) {
            msg.channel.sendMessage(inviteLink);
        }
    });
}
