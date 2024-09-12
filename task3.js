const crypto = require('crypto');

// Random 256-bit key and computes HMAC
class HMACGenerator {
    static generateKey() { return crypto.randomBytes(32).toString('hex'); }
    static generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

// Validates moves
class MoveValidator {
    static validateMoves(moves) {
        if (moves.length % 2 === 0)
            throw new Error('Number of moves must be odd.');
        if (new Set(moves).size !== moves.length)
            throw new Error('Moves must be unique.');
    }
}

// Game logic
class GameLogic {
    constructor(moves) {
        this.moves = moves;
        this.key = HMACGenerator.generateKey();
        this.generateComputerMove();
    }

    generateComputerMove() {
        const index = crypto.randomInt(this.moves.length);
        this.computerMove = this.moves[index];
        this.hmac = HMACGenerator.generateHMAC(this.key, this.computerMove);
    }

    determineWinner(userMoveIndex) {
        const compIndex = this.moves.indexOf(this.computerMove);
        const half = Math.floor(this.moves.length / 2);
        if (userMoveIndex === compIndex) return 'Draw';
        return (userMoveIndex > compIndex && userMoveIndex <= compIndex + half) || 
               (userMoveIndex < compIndex && userMoveIndex + this.moves.length <= compIndex + half) ? 'You win!' : 'Computer wins!';
    }
}

// Help table
class HelpTable {
    static display(moves) {
        const n = moves.length;
        const columnWidth = Math.max(...moves.map(m => m.length), 'v PC\\User >'.length) + 2;
        
        const header = `| v PC\\User >   | ${moves.map(m => m.padEnd(columnWidth)).join(' | ')} |`;
        console.log(`+${'-'.repeat(header.length - 2)}+`);
        console.log(header);
        console.log(`+${'-'.repeat(header.length - 2)}+`);

        for (let i = 0; i < n; i++) {
            let row = `| ${moves[i].padEnd(columnWidth)} |`;
            for (let j = 0; j < n; j++) {
                row += ` ${HelpTable.getResult(i, j).padEnd(columnWidth)} |`;
            }
            console.log(row);
            console.log(`+${'-'.repeat(header.length - 2)}+`);
        }
    }

    static getResult(i, j) {
        if (i === j) return 'Draw';
        const n = HelpTable.moves.length;
        const half = Math.floor(n / 2);
        return ((i < j && j <= i + half) || (i > j && j + n <= i + half)) ? 'Win' : 'Lose';
    }
}
// Example usage
const moves = process.argv.slice(2);
if (moves.length < 3) {
  console.error('Please provide at least 3 moves.');
  process.exit(1);
}

HelpTable.moves = moves;


// Play Game function
function playGame() {
    const moves = process.argv.slice(2);
    try {
        MoveValidator.validateMoves(moves);
        const game = new GameLogic(moves);
        console.log(`HMAC: ${game.hmac}`);
        moves.forEach((move, i) => console.log(`${i + 1} - ${move}`));
        console.log('0 - Exit\n? - Help');

        require('readline').createInterface({ input: process.stdin, output: process.stdout })
            .question('Enter your move: ', input => {
                if (input === '?') HelpTable.display(moves);
                else if (input === '0') console.log('Exiting game.');
                else {
                    const userMoveIndex = parseInt(input) - 1;
                    if (isNaN(userMoveIndex) || userMoveIndex < 0 || userMoveIndex >= moves.length) console.log('Invalid choice, try again.');
                    else {
                        console.log(`Your move: ${moves[userMoveIndex]}`);
                        console.log(`Computer move: ${game.computerMove}`);
                        console.log(game.determineWinner(userMoveIndex));
                        console.log(`HMAC key: ${game.key}`);
                    }
                }
                process.exit();
            });
    } catch (error) {
        console.error(`${error.message}\nExample: node game.js rock paper scissors`);
    }
}

playGame();