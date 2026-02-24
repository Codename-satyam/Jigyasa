import beast from "../../../../Assets/g6/Beast.png"
import mystic from "../../../../Assets/g6/mystic-sphynx.png"
import samurai from "../../../../Assets/g6/enigma-samurai.png"
import socceror from "../../../../Assets/g6/puzzle-socceror.png"
import admin from "../../../../Assets/g6/ADMIN.png"
import goblin from "../../../../Assets/g6/goblin.png"

const enemyPool=[
    {
        name: "Logic Beast",
        Image: beast,
        baseHp: 80,
        baseDamage: 10,
        hpPerLevel: 20,
    },
    {
        name: "Riddle Goblin",
        Image: goblin,
        baseHp: 60,
        baseDamage: 15,
        hpPerLevel: 15,
    },
    {
        name: "Puzzle Sorcerer",
        Image: socceror,
        baseHp: 100,
        baseDamage: 8,
        hpPerLevel: 25,
    },
    {
        name: "Enigma Knight",
        Image: samurai,
        baseHp: 120,
        baseDamage: 12,
        hpPerLevel: 30,
    },
    {
        name: "Mystic Sphinx",
        Image: mystic,
        baseHp: 90,
        baseDamage: 20,
        hpPerLevel: 18,
    },
    {
        name: "ADMIN",
        Image: admin,
        baseHp: 500,
        baseDamage: 70,
        hpPerLevel: 50,
    }
]

export { enemyPool };