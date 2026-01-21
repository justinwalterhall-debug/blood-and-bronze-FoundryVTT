export class BloodAndBronzeItem extends Item {
  
  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
    // Data preparation before derived data
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.bloodandbronze || {};
  }

  async roll() {
    const item = this;

    // Create a chat message for the item
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If item has a damage roll (weapon)
    if (item.type === 'weapon' && item.system.damage) {
      const roll = new Roll(item.system.damage);
      await roll.evaluate();
      
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label
      });
      
      return roll;
    } else {
      // Otherwise, just show the item
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        content: `<h3>${label}</h3><p>${item.system.description || ''}</p>`
      });
    }
  }
}
