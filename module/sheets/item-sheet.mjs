export class BloodAndBronzeItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["blood-and-bronze", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  get template() {
    const path = "systems/blood-and-bronze/templates/item";
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);

    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Roll item
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    if (this.item) {
      this.item.roll();
    }
  }
}
