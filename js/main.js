// selectors
const boardElement = document.getElementById("board");
const actioncam = document.getElementById("action-cam");

// sounds
const sounds = {
  bg: new Audio("sounds/bg.mp3"),
  loot: new Audio("sounds/loot.mp3"),
  trade: new Audio("sounds/trade.wav"),
  pattack: new Audio("sounds/pattack.wav"),
  mattack: new Audio("sounds/mattack.wav"),
  gold: new Audio("sounds/gold.wav"),
  levelup: new Audio("sounds/levelup.wav"),
  death: new Audio("sounds/death.wav"),
  battle: new Audio("sounds/battle.mp3"),
  win: new Audio("sounds/win.mp3")
};

// game state. Is used in the keyboard event listener to prevent user action if game is over
let GAME_STATE = "PLAY";

const board = new Board(20, 25);
board.render(boardElement);

// init board
// Create a board with 20 rows and 25 columns (can play around to test different sizes) and render it

const centerPosition = new Position(
  Math.floor(board.rows.length / 2),
  Math.floor(board.rows[0].length / 2)
);

const player = new Player(
  "Van",
  centerPosition,
  board,
  1,
  [new Potion(0), new Bomb(0)],
  20
);

player.render(boardElement);

// init player
// create player at the center of the board with 2 items and render it

// Keep this, used to display the information on the box on the right of the board
updateActionCam();

// board entities

// monsters

// Create all the monsters entities and set them on the board at a random position
// Give each monster a random name, random level (1-3), a potion (random rarity 0-3), random gold (0-50)
// Give one monster the key
for (let i = 0; i < MAX_MONSTERS; i++) {
  board.setEntity(new Monster(), getRandomPosition(board));
}

// items
// Add code to create a potion and a bomb entity and set them at a random board position
board.setEntity(new Potion(0), getRandomPosition(board));
board.setEntity(new Bomb(0), getRandomPosition(board));

// gold
// Add code to create a gold entity and place it at a random position on the board
board.setEntity(new Gold(50), getRandomPosition(board));

// dungeons
// Add code for an opened dungeon and a closed dungeon you can loot (random position)
board.setEntity(
  new Dungeon(true, false, 200, [new Potion(1), new Bomb(2)]),
  getRandomPosition(board)
);
board.setEntity(
  new Dungeon(false, false, 500, [new Potion(3), new Bomb(3)]),
  getRandomPosition(board)
);

// Add code for a dungeon that is closed and has the princess (random position)
board.setEntity(
  new Dungeon(false, true, 0, [new Potion(3)]),
  getRandomPosition(board)
);

// tradesman
// Add code for a tradesman with a potion of each rarity (0 to 3), bomb of each rarity and a key at a random position
let tradesmanItems = [];
for (let i = 0; i < 4; i++) {
  tradesmanItems.push(new Potion(i));
  tradesmanItems.push(new Bomb(i));
}
tradesmanItems.push(new Key());
board.setEntity(new Tradesman(tradesmanItems), getRandomPosition(board));
// event handlers

let monsterAttack;
// UPDATE this event listener to move the player
// Add code to check if the entity at the new player position (after move) is a monster. If so, call the encounterMonster function
document.addEventListener("keydown", ev => {
  if (!ev.key.includes("Arrow") || GAME_STATE === "GAME_OVER") return;
  player.move(ev.key);
  if (sounds.bg.paused) playMusic("bg");
  clearInterval(monsterAttack); // stop monster attack when player moves
  let entity = board.getEntity(player.position);
  if (entity instanceof Monster) {
    encounterMonster(entity);
  }
  updateActionCam();
});

// helper functions

// UPDATE the function to return a random position on the board that is not occupied by an entity (Grass is fine) or the player's initial position (center)
// The parameter is a Board object
function getRandomPosition(board) {
  let check = true;
  let x = 0;
  let y = 0;
  while (check) {
    x = getRandom(1, board.rows.length - 2);
    y = getRandom(1, board.rows[0].length - 2);
    check = !board.rows[x][y].element.src.includes("grass");
  }
  return new Position(x, y);
}

// UPDATE the function passed to setInterval to attack the player and trigger player death if hp is 0 or lower
// The parameter is a Monster object
// Replace the interval time of 1000 by the monster attack speed
// Replace the hp printed to be the player's hp
function encounterMonster(monster) {
  playMusic("battle");
  monsterAttack = setInterval(() => {
    monster.attack(player);
    document.getElementById("Player-hp").textContent = `HP: ${player.hp}`;
    if (player.hp <= 0) playerDeath();
  }, monster.attackSpeed);
}

// Use when the player is dead, no need to change anything
function playerDeath() {
  clearInterval(monsterAttack);
  boardElement.innerHTML = "<h1>GAME OVER</h1>";
  document.getElementById("player-cam").src = "imgs/player/dead.png";
  document.getElementById("action-menu").style.display = "none";
  GAME_STATE = "GAME_OVER";
  playMusic("death");
}

// UPDATE this function to getExp from monster, loot the monster, and clear the entity (monster) at the player position
function defeatMonster(monster) {
  clearInterval(monsterAttack);
  clearEntity(player.position);
  player.getExp(monster);
  player.items = player.items.concat(monster.items);
  playMusic("bg");
}

// UPDATE this function to set the board entity at position to a grass entity
function clearEntity(position) {
  board.setEntity(new Grass(), position);
}

// DOM manipulation functions

// This function updates the 'action cam' - the box showing the enemy and player info as well as the actions
// It is called after an event happened (e.g. used item) to update the information shown in the action box
// UPDATE the entity variable to be the entity at the player position
function updateActionCam() {
  const entity = board.getEntity(player.position);
  actioncam.innerHTML = "";
  actioncam.appendChild(createActionView(entity));
  actioncam.appendChild(createActionView(player));
  actioncam.appendChild(createActionMenu(entity));
}

// UPDATE this function based on the comments
// Replace the if condition calling createCreatureView to only execute if the entity is a creature
// Replace the if condition creating the h4 value element to only execute if the entity has a value
// Replace the ternary condition setting the img.id to be 'player-cam' if the entity is a Player, 'entity-cam' otherwise
// Replace the ternary condition setting the img.src to be 'imgs/player/attack.png' if the entity is a Player, else use the entity's image src
function createActionView(entity) {
  const actionView = document.createElement("div");
  actionView.className = "action-view";
  const infoWrapper = document.createElement("div");

  const name = document.createElement("h3");
  if (entity instanceof Creature) {
    name.textContent = "" + entity.name;
  } else if (entity instanceof Player) {
    name.textContent = "" + player.name;
  } else {
    name.textContent = "" + entity.constructor.name;
  }
  // Add code here to set the name text to be the entity name or use the constructor name as fallback
  infoWrapper.appendChild(name);

  if (entity instanceof Creature) createCreatureView(infoWrapper, entity);
  if (entity.value) {
    const value = document.createElement("h4");
    value.textContent = "Value: " + entity.value; // Add code here to set the value text to the entity's value e.g. "Value: 20"
    infoWrapper.appendChild(value);
  }

  // Add the entity image
  const img = document.createElement("img");
  img.id = entity instanceof Player ? "player-cam" : "entity-cam";
  img.src =
    entity instanceof Player ? "imgs/player/attack.png" : entity.element.src;
  actionView.appendChild(infoWrapper);
  actionView.appendChild(img);

  return actionView;
}

// UPDATE this function based on the comments
function createCreatureView(root, creature) {
  const level = document.createElement("h4");
  level.textContent = "Level " + creature.level; // Add code here to set the level text to the creature's level e.g. "Level 1"
  const hp = document.createElement("h4");
  hp.id = creature.constructor.name + "-hp";
  hp.textContent = "HP: " + creature.hp; // Add code here to set the hp text to the creature's hp e.g. "HP: 100"
  const gold = document.createElement("h4");
  gold.textContent = "Gold: " + creature.gold;
  // Add code here to set the gold text to the creature's gold e.g. "Gold: 10"
  root.appendChild(hp);
  root.appendChild(level);
  root.appendChild(gold);
}

// UPDATE this function to create the appropriate menu based on the entity type. Use the createMenu functions (e.g. createPickupMenu)
function createActionMenu(entity) {
  const actionMenu = document.createElement("div");
  actionMenu.id = "action-menu";
  if (entity instanceof Monster) createMonsterMenu(actionMenu, entity);
  if (entity instanceof Item || entity instanceof Gold)
    createPickupMenu(actionMenu, entity);
  if (entity instanceof Tradesman) createTradeMenu(actionMenu, entity);
  if (entity instanceof Dungeon) createDungeonMenu(actionMenu, entity);
  return actionMenu;
}

// UPDATE the pickupBtn event listener function to pickup the entity
// Add a call to clearEntity in the listener function to set a Grass entity at the player position
function createPickupMenu(root, entity) {
  const actions = document.createElement("div");
  actions.textContent = "Actions";
  const pickupBtn = document.createElement("button");
  pickupBtn.textContent = "Pickup";
  pickupBtn.addEventListener("click", () => {
    if (entity instanceof Item || entity instanceof Gold) {
      player.pickup(entity);
      clearEntity(player.position);
    }
    updateActionCam();
  });
  actions.appendChild(pickupBtn);
  root.appendChild(actions);
}

// UPDATE this function to add a call to createItemActions(root, monster) if the player has items
// Update the attackBtn event listener to attack the monster
// Update the if condition to execute only if the monster hp is 0 or lower. When true, call defeatMonster.
// Replace the timeout value (1000) passed to disable the attackBtn to be the player's attack speed
function createMonsterMenu(root, monster) {
  const actions = document.createElement("div");
  actions.textContent = "Actions";
  let attackBtn = document.createElement("button");
  attackBtn.textContent = "Attack";
  if (player.items > 0) createItemsActions(root, monster);
  //clearTimeout(monsterAttack);
  // Add code here to reset the player attack timeout to allow the player to attack a monster as soon as one is encountered
  attackBtn.addEventListener("click", () => {
    player.attack(monster);
    if (monster.hp <= 0) {
      defeatMonster(monster);
      updateActionCam();
    } else {
      attackBtn.disabled = true;
      setTimeout(() => (attackBtn.disabled = false), player.attackSpeed);
      // Replace the hp printed to be the monster's hp
      document.getElementById("Monster-hp").textContent = `HP: ${monster.hp}`;
    }
  });
  actions.appendChild(attackBtn);
  root.appendChild(actions);
}

// UPDATE
// update the forEach call to be on the player's items instead of an empty array
// update the function passed to forEach to return immediately if the item is a Key (the key is not a valid item in a battle)
// update the itemBtn event listener to call useItem on the player for potions, useItem on the monster for Bombs.
// Add a call to defeatMonster if its hp is 0 or lower
function createItemActions(root, monster) {
  const items = document.createElement("div");
  items.textContent = "Items";
  player.items.forEach(item => {
    if (item.type === "key") return;
    const itemBtn = document.createElement("button");
    itemBtn.textContent = item.name;
    // Add code here to set the itemBtn text to the item name
    itemBtn.addEventListener("click", () => {
      useItem(potion, player);
      useItem(bomb, monster);
      if (monster.hp <= 0) defeatMonster(monster);
      else {
        items.removeChild(itemBtn);
        document.getElementById("Player-hp").textContent = `HP: ${player.hp}`;
        document.getElementById("Monster-hp").textContent = `HP: ${monster.hp}`;
      }
    });
    items.appendChild(itemBtn);
  });
  root.appendChild(items);
}

// UPDATE
// update the first forEach call to be on the tradesman's items instead of an empty array
// update the second forEach call to be on the player's items instead of an empty array
// Add code to the itemBtn event listener to buy the clicked item
// Add code to the itemBtn event listener to sell the clicked item
function createTradeMenu(root, tradesman) {
  const buyAction = document.createElement("div");
  buyAction.textContent = "Buy";
  tradesman.items.forEach(item => {
    const itemBtn = document.createElement("button");
    itemBtn.textContent = "" + item.name + " - " + item.value + "G";
    if (player.gold < item.value) itemBtn.disabled = true;
    // Add code here to set the item text to the item's name and value e.g. "Common potion - 10G"
    // Add code here to set itemBtn to disabled if the player does not have enough gold for the item
    itemBtn.addEventListener("click", () => {
      player.buy(item, tradesman);
      updateActionCam();
    });
    buyAction.appendChild(itemBtn);
  });
  const sellAction = document.createElement("div");
  sellAction.textContent = "Sell";
  player.items.forEach(item => {
    const itemBtn = document.createElement("button");
    itemBtn.textContent = "" + item.name + " - " + item.value + "G";
    // Add code here to set the item text to the item's name and value e.g. "Common potion - 10G"
    itemBtn.addEventListener("click", () => {
      player.sell(item, tradesman);
      updateActionCam();
    });
    sellAction.appendChild(itemBtn);
  });
  root.appendChild(buyAction);
  root.appendChild(sellAction);
}

// UPDATE the function based on the comments
// Update the condition to create the openBtn only if the dungeon is not open
// Update the if condition inside the else block to only win the game if the dungeon has the princess
// Update the openBtn event listener to use the key item on the dungeon
// Update the lootBtn event listener to loot the dungeon
function createDungeonMenu(root, dungeon) {
  const actions = document.createElement("div");
  actions.textContent = "Actions";
  if (dungeon.isOpen !== true) {
    const openBtn = document.createElement("button");
    openBtn.textContent = "Open";

    // Add code to get the key from the player items
    // If the player does not have a key, set the openBtn to disabled
    const key = player.items.find(item => item.type === "key");
    if (!key) openBtn.disabled = true;
    openBtn.addEventListener("click", () => {
      player.useItem(key, dungeon);
      updateActionCam();
    });
    actions.appendChild(openBtn);
    root.appendChild(actions);
  } else {
    if (dungeon.hasPrincess === true) {
      boardElement.innerHTML =
        '<h1>You WIN!</h1><img src="imgs/dungeon/princess.png" width=500/>';
      actioncam.style.display = "none";
      GAME_STATE = "GAME_OVER";
      playMusic("win");
    } else {
      const lootBtn = document.createElement("button");
      lootBtn.textContent = "Loot";
      if (dungeon.gold || dungeon.items) {
        // Add code here to check if the dungeon has gold or items, if not set the lootBtn to disabled
        lootBtn.addEventListener("click", () => {
          player.loot(dungeon);
          updateActionCam();
        });
      } else {
        lootBtn.disabled = true;
      }
      actions.appendChild(lootBtn);
      root.appendChild(actions);
    }
  }
}

// utility functions - no need to change them

// Plays a background music while ensuring no other music is playing at the same time
function playMusic(music) {
  sounds.bg.pause();
  sounds.battle.currentTime = 0;
  sounds.battle.pause();
  sounds[music].play();
}

// Play sound from the start
function playSound(sound) {
  sounds[sound].currentTime = 0;
  sounds[sound].play();
}

// Returns a random integer between min and max (max included)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// removes an element from the array
function remove(arr, element) {
  arr.splice(arr.indexOf(element), 1);
}

let x5 = 1;
