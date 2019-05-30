//Create the Item, Potion, Bomb and Key class

class Item extends Entity {
  constructor(value, rarity, type) {
    super(`imgs/items/${type}.png`);
    this.value = value;
    this.type = type;
    this.rarity = ITEM_RARITIES[rarity];
    this.name = this.rarity + " " + this.type;
    this.sound = new Audio(`sounds/${type}.wav`);
    this.element.style.backgroundImage = "url(imgs/environment/grass1.png)";
  }
}

/*
Item class definition. Item is an Entity
- constructor
  - parameters: value (number), rarity (number), type (string)
  - Creates an item with the correct image (depends on type).
  - Sets the name based on the rarity (with ITEM_RARITIES) and the type.
- name (string)
- value (number)
- rarity (number)
- sound (Audio object - type is used for the sound file path)
Example use: not used by itself. 
*/
class Potion extends Item {
  constructor(rarity) {
    super(null, rarity, "potion");
    this.rarity = rarity;
    this.value = (rarity + 1) * 10;
    this.potency = (rarity + 1) * 10;
  }
  use(target) {
    if (target.hp + this.potency > target.getMaxHp()) {
      target.hp = target.getMaxHp();
    } else {
      target.hp += this.potency;
    }
  }
}

/*
Potion class definition. Potion is an Item
- constructor
  - parameters: rarity (number)
  - Creates a potion with type 'potion' and a value based on rarity: (rarity + 1) * 10
- potency (number): (rarity + 1) * 10
- use (function)
 - parameters: target (Creature)
 - Restores hp of target by potency value. HP of target can't go past its max HP.
 - Plays the item sound
Example use:
new Potion(0) // potion rarity 0
*/

class Bomb extends Item {
  constructor(rarity) {
    super(null, rarity, "bomb");
    this.rarity = rarity;
    this.value = (rarity + 1) * 10;
    this.damage = (rarity + 1) * 30;
  }
  use(target) {
    if (target.hp - this.damage < 0) {
      target.hp = 0;
    } else {
      target.hp -= this.damage;
    }
  }
}

/*
Bomb class definition. Bomb is an Item
- constructor
  - parameters: rarity (number)
  - Creates a bomb with type 'bomb' and a value based on rarity: (rarity + 1) * 20
- damage (number): (rarity + 1) * 30
- use (function)
 - parameters: target (Creature)
 - Damages hp of target by damage value. HP of target can't be lower than 0.
 - Plays the item sound
Example use:
new Bomb(0) // bomb rarity 0
*/

class Key extends Item {
  constructor() {
    super(null, 3, "key");
    this.value = 100;
  }
  use(target) {
    target.open();
    if (target.hasPrincess !== true) this.sound.play();
  }
}

/*
Key class definition. Key is an Item
- constructor
  - parameters: none
  - Creates a key with value 100, rarity 3 and type 'key'
- use (function)
 - parameters: target (Dungeon)
 - opens the dungeon and plays the item sound if the dungeon does not have the princess
Example use:
new Key(0) // bomb rarity 0
*/
