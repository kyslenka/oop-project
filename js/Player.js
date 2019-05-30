//Create the Player class

class Player extends Creature {
  constructor(name, position, board, level, items = [], gold) {
    super(name, "imgs/player/front.png", level, items, gold);
    this.element.setAttribute("id", "player");
    this.name = name;
    this.position = position;
    this.board = board;
    this.level = level;
    this.items = items;
    this.gold = gold;
    this.attackSpeed = 2000 / level;
    this.exp = 0;
  }
  render(root) {
    this.element.style.position = "absolute";
    this.element.style.top = this.position.row * ENTITY_SIZE + "px";
    this.element.style.left = this.position.column * ENTITY_SIZE + "px";
    root.appendChild(this.element);
  }
  update() {
    let oldPlayer = document.getElementById("player");
    let root = oldPlayer.parentElement;
    root.removeChild(oldPlayer);
    this.render(root);
  }
  moveToPosition(position) {
    this.position = position;
    this.update();
  }
  move(direction) {
    let oldPositionX = this.position.row;
    let oldPositionY = this.position.column;
    if (direction === "ArrowDown") {
      this.position.row = this.position.row + 1;
      this.element.src = "imgs/player/front.png";
    }
    if (direction === "ArrowUp") {
      this.position.row = this.position.row - 1;
      this.element.src = "imgs/player/back.png";
    }
    if (direction === "ArrowLeft") {
      this.position.column = this.position.column - 1;
      this.element.src = "imgs/player/left.png";
    }
    if (direction === "ArrowRight") {
      this.position.column = this.position.column + 1;
      this.element.src = "imgs/player/right.png";
    }
    let entity = board.getEntity(this.position);
    if (entity.element.src === board.rows[0][0].element.src) {
      this.position.row = oldPositionX;
      this.position.column = oldPositionY;
    }
    this.moveToPosition(this.position);
  }
  pickup(entity) {
    playSound("loot");
    if (entity instanceof Item) {
      this.items.push(entity);
    } else if (entity instanceof Gold) {
      this.gold += entity.value;
    }
  }
  attack(entity) {
    super.attack(entity);
    playSound("pattack");
  }
  buy(item, tradesman) {
    if (this.gold < item.value) return false;
    this.items.push(item);
    this.gold -= item.value;
    remove(tradesman.items, item);
    tradesman.gold += item.value;
    playSound("trade");
    return true;
  }

  sell(item, tradesman) {
    if (tradesman.gold < item.value) return false;
    remove(this.items, item);
    this.gold += item.value;
    tradesman.items.push(item);
    tradesman.gold -= item.value;
    playSound("trade");
    return true;
  }

  useItem(item, target) {
    item.use(target);
    remove(this.items, item);
  }

  loot(entity) {
    this.items = this.items.concat(entity.items);
    entity.items = [];
    this.gold += entity.gold;
    entity.gold = 0;
    playSound("loot");
  }
  getExpToLevel() {
    return this.level * 20;
  }
  getExp(entity) {
    const exp = this.exp + entity.level * 10;
    if (exp >= this.getExpToLevel()) {
      this.exp = exp - this.getExpToLevel();
      this.levelUp();
    } else {
      this.exp = exp;
    }
  }
  levelUp() {
    this.level++;
    this.hp = this.getMaxHp();
    this.strength = this.level * 10;
    this.attackSpeed = 3000 / this.level;
    playSound("levelup");
  }
}

/*
Player class definition. Player is a Creature
- constructor
  - parameters: name (string), position (Position), board (Board), level (number), items (Item[]), gold (number)
  - Sets the attackSpeed to 2000 / level
  - Sets the exp to 0
  - Sets the position and board
- attackSpeed (number)
- exp (number)
- position (Position)
- board (Board)
- render (function)
  - parameters: root (HTMLElement)
  - Appends the element to the root (the board HTML element)
  - Updates the player position
- update (function)
  - parameters: none
  - Updates the player's HTML element position based on its position property and ENTITY_SIZE
- moveToPosition (Position)
  - moves to position specified unless it is a Wall entity.
  - updates player (update method)
- move (function)
  - parameters: direction (string)
  - Sets the player image based on direction and moves to new position
- pickup (function)
  - parameters: entity (Item || Gold)
  - Adds item or gold and plays the corresponding sound ('loot' or 'gold' respectively)
- attack (function)
  - parameters: (entity)
  - calls the attack method from Creature (use super) and plays the 'pattack' sound if the attack was successful
- buy (function)
  - parameters: item (Item), tradesman (Tradesman)
  - updates gold and items for both player and tradesman.
  - Plays the trade sound
  - returns true if successful trade, false if gold is insufficient
- sell (function)
  - parameters: item (Item), tradesman (Tradesman)
  - updates gold and items for both player and tradesman.
  - Plays the trade sound
  - returns true if successful trade, false if gold is insufficient
- useItem (function)
  - parameters: item (Item), target (Creature)
  - uses the item on the target and removes it from the player
- loot (function)
  - parameters: entity (Monster || Dungeon)
  - Updates gold and items for both player and dungeon or monster.
  - plays the loot sound
- getExpToLevel (function)
  - parameters: none
  - returns exp needed to level: level * 10
- getExp (function)
  - parameters: entity (Monster)
  - adds exp based on entity level (level * 10)
  - level up if enough exp. It is possible to level up multiple times at once if enough exp is earned (e.g. beat enemy level 3)
- levelUp (function)
  - parameters: entity (Monster)
  - Increments level, sets hp to max hp
  - updates strength (level * 10) and attack speed (3000 / level)
  - plays levelup sound
Example use:
new Player('Van', new Position(5, 5), new Board(10, 10), 1, [new Potion(0)]);
*/
