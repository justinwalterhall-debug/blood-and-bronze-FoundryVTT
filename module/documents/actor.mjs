export class BloodAndBronzeActor extends Actor {
  
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
    // Data preparation happens before derived data
  }

  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.bloodandbronze || {};

    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Calculate ability scores from rating and score
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      ability.ability = ability.rating + ability.score;
    }

    // Calculate derived values
    this._calculateDefense(systemData);
    this._calculateEndurance(systemData);
    this._calculateBurden(actorData);
  }

  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
    
    const systemData = actorData.system;
    
    // Calculate ability scores
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      ability.ability = ability.rating + ability.score;
    }
  }

  _calculateDefense(systemData) {
    // Defense calculation - base from armor
    let defense = systemData.armor?.total || 0;
    
    // Add equipped armor bonuses
    const armor = this.items.filter(i => i.type === 'armor');
    armor.forEach(item => {
      if (item.system.defense) {
        defense += item.system.defense;
      }
    });
    
    systemData.defense.total = defense;
  }

  _calculateEndurance(systemData) {
    // Endurance max calculation based on Vigor
    const vigorAbility = systemData.abilities.vigor.ability || 0;
    systemData.endurance.max = 10 + vigorAbility;
    
    // Ensure current doesn't exceed max
    if (systemData.endurance.current > systemData.endurance.max) {
      systemData.endurance.current = systemData.endurance.max;
    }
  }

  _calculateBurden(actorData) {
    const systemData = actorData.system;
    let totalBurden = 0;

    // Calculate burden from equipment
    this.items.forEach(item => {
      if (item.system.weight) {
        const quantity = item.system.quantity || 1;
        totalBurden += item.system.weight * quantity;
      }
    });

    systemData.burden.total = totalBurden;
  }

  async rollAbility(abilityName) {
    const ability = this.system.abilities[abilityName];
    if (!ability) return;

    const roll = new Roll("1d20 + @abilityMod", {
      abilityMod: ability.ability
    });

    await roll.evaluate();
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${abilityName.toUpperCase()} Check`
    });

    return roll;
  }
}
