const colors = require('colors');
const cp = require('child_process');
const config = require('./config.json');
const mira = config.mira;
const eclipse = config.eclipse;
const miraAndEclipse = config.miraAndEclipse;
const fs = require('fs');
const readline = require('readline');
const userSetup = {};
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// const branchName = require('current-git-branch');
// const CurrentGitBranch = require('current-git-branch');
let cordovaBuildRelease = false;
let cordovaRun = false;
let command = null;

function branchName() {
    const branchName = require('current-git-branch');
    return branchName();
}

function start() {
    // ask user a question
    interface.question("What app(s) would you like to build? \n".yellow.underline, async (userInput) => {
        // process user input
        let navigatePath = '';
        let input = userInput.toLowerCase();
        if (input === 'none' || input === 'neither' || input === 'n' || input === 'no') {
            console.clear();
            await hiddenMenu().then(data => {
                console.log(data);
            }).catch(e => {
                console.log('error:'.red, e);
            });
            start();
            return;
        } else if (input === 'clear' || input === 'cls' || input === 'c') {
            console.clear();
            start();
            return;
        } else if (input === 'mira' || input === 'm') {
            navigatePath = `../${mira}/client`;
            input = 'mira';
            command = 'build';
            cordovaRun = true;
        } else if (input === 'eclipse' || input === 'e') {
            navigatePath = `../${eclipse}/client`;
            input = 'eclipse';
            command = 'build';
            cordovaRun = true;
        } else if (input === 'both' || input === 'b' || (input.indexOf('mira') !== -1 && input.indexOf('eclipse') !== -1) || input === 'm e' || input === 'me' || input === 'e m' || input === 'em') {
            navigatePath = `../${mira}/client`;
            input = 'both';
            command = 'build';
            cordovaRun = true;
        } else if (input.indexOf('tori') !== -1) {
            console.log("error: cancer detected".random);
            start();
            return;
        } else if (input === 'config' || input === 'config.json') {
            console.table(config);
            start();
            return;
        } else if (input === 'cwd') {
            console.log(process.cwd());
            start();
            return;
        } else if (input === 'release' || input === 'r') {
            input = 'mira';
            navigatePath = `../${mira}/client`;
            command = 'release';
            cordovaBuildRelease = true;
        } else if (input === 'exit') {
            console.log("not complete".red);
            start();
            return;
        } else if (input === 'help' || input === 'h') {
            console.table({
                help: {
                    command: "help | h",
                    description: "list of all commands available"
                },
                mira: {
                    command: "mira | m",
                    description: `build out the mira app from your "${mira}" folder`
                },
                eclipse: {
                    command: "eclipse | e",
                    description: `build out the eclipse app from your "${eclipse}" folder`
                },
                both: {
                    command: "both | b | m e | e m | mira eclipse | eclipse mira",
                    description: "build out both mira and eclipse"
                },
                config: {
                    command: "config | config.json",
                    description: "display all config.json data"
                },
                directory: {
                    command: "cwd",
                    description: "display the current working directory"
                },
                clear: {
                    command: "clear | cls | c",
                    description: "clear the console"
                },
            });
            start();
            return;
        } else {
            console.log('input is not valid'.red);
            start();
            return;
        }
        console.log(`preparing ${input.blue} ${command}(s)...`);

        // change to wanted path
        process.chdir(navigatePath);

        // execute command in new path
        if (cordovaRun) {
            try {
                console.log('building in', process.cwd());
                const data = cp.execSync('cordova run android');
                console.log(data.toString());
                switch (input) {
                    case 'mira':
                        console.log('mira'.blue, 'build finished with no errors'.green);
                        break;
                    case 'eclipse':
                        console.log('eclipse'.blue, 'build finished with no errors'.green);
                        break;
                    default:
                        console.log('build finished with no errors'.green);
                }
                console.log('process.cwd()', process.cwd())
                console.log('current git branch:'.gray, branchName().cyan);
            } catch (error) {
                console.log('error found'.red);
                // console.log('ERROR: 1', error);
            }
        } else if (cordovaBuildRelease) {
            try {
                console.log('building release in', process.cwd());
                const data = cp.execSync('cordova build android --release');
                console.log(data.toString());
                switch (input) {
                    case 'mira':
                        console.log('mira'.blue, 'release finished with no errors'.green);
                        break;
                    case 'eclipse':
                        console.log('eclipse'.blue, 'release finished with no errors'.green);
                        break;
                    default:
                        console.log('release finished with no errors'.green);
                }
                console.log('current git branch:'.gray, branchName().cyan);
            } catch (error) {
                console.log('error found'.red);
                // console.log('ERROR: 3', error);
            }
        }

        // if both was entered begin to build eclipse now
        if (input === 'both') {
            try {
                console.log('changing directory...');
                process.chdir(`../../${eclipse}/client`);
                console.log('building in', process.cwd());
                const data = cp.execSync('cordova run android');
                console.log(data.toString());
                console.log('eclipse'.blue, 'build finished with no errors'.green);
                console.log('current git branch:'.gray, branchName().cyan);
            } catch (error) {
                console.log('error found'.red);
                // console.log('ERROR 2:', error);
            }
        }

        // change back to original directory and ask question again
        process.chdir(`../../${miraAndEclipse}`);
        start();
    });
}

// start application
start();

// hidden settings menu
const hiddenMenu = () => {
    return new Promise((resolve, reject) => {
        // ask user a question
        interface.question('Welcome, what else can i assist you with? \n'.grey.underline, async (userInput) => {
            let input = userInput.toLowerCase();
            if (input === 'setup' || input === 's') {
                await getMiraName();
                await getEclipseName();
                await getMiraEclipseName();
                fs.writeFileSync('./config.json', JSON.stringify({
                    "mira": userSetup.mira,
                    "eclipse": userSetup.eclipse,
                    "miraAndEclipse": userSetup.miraAndEclipse
                }, null, '\t'));
                console.log('\nyou have successfully updated your config.json'.green);
                end();
                resolve('please restart the app to continue (ctrl + c)'.red);
            }
            reject('input is not valid'.red);
        })
    })
}

const getMiraName = () => {
    return new Promise((resolve, reject) => {
        interface.question(`${'What is the name of your'.blue} ${'mira'.yellow} ${'repository?'.blue}\n`, userInput => {
            userSetup.mira = userInput;
            resolve();
        })
    })
}

const getEclipseName = () => {
    return new Promise((resolve, reject) => {
        interface.question(`${'What is the name of your'.blue} ${'eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
            userSetup.eclipse = userInput;
            resolve();
        })
    })
}

const getMiraEclipseName = () => {
    return new Promise((resolve, reject) => {
        interface.question(`${'What is the name of your'.blue} ${'mira / eclipse'.yellow} ${'repository?'.blue}\n`, userInput => {
            userSetup.miraAndEclipse = userInput;
            resolve();
        })
    })
}

// this will be called if the config.json was updated and now requires a restart
const end = () => {
    setInterval(function () {
        console.log('please restart the app to continue (ctrl + c)'.red);
    }, 5000);
}