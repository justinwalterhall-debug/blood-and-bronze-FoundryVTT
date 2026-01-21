export class BloodAndBronzeActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["blood-and-bronze", "sheet", "actor"],
      width: 720,
      height: 880,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  get template() {
    return `systems/blood-and-bronze/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors
    context.rollData = context.actor.getRollData();

    return context;
  }

  _prepareCharacterData(context) {
    // Ability scores
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = k.charAt(0).toUpperCase() + k.slice(1);
    }
  }

  _prepareItems(context) {
    // Initialize containers
    const weapons = [];
    const armor = [];
    const equipment = [];
    const covenants = [];
    const conditions = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      
      if (i.type === 'weapon') {
        weapons.push(i);
      } else if (i.type === 'armor') {
        armor.push(i);
      } else if (i.type === 'equipment') {
        equipment.push(i);
      } else if (i.type === 'covenant') {
        covenants.push(i);
      } else if (i.type === 'condition') {
        conditions.push(i);
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.armor = armor;
    context.equipment = equipment;
    context.covenants = covenants;
    context.conditions = conditions;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Edit item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Rollable abilities
    html.find('.rollable').click(this._onRoll.bind(this));

    // Checkbox handling for abilities
    html.find('.ability-rating input[type="checkbox"]').change(this._onAbilityRatingChange.bind(this));
    html.find('.ability-score input[type="checkbox"]').change(this._onAbilityScoreChange.bind(this));

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onAbilityRatingChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ability = element.closest('.ability-box').dataset.ability;
    const isChecked = element.checked;
    const index = parseInt(element.dataset.index);

    let rating = 0;
    if (isChecked) {
      rating = index;
    } else {
      // Find the highest checked box below this one
      const checkboxes = element.closest('.ability-rating').querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked && i < index) {
          rating = i;
        }
      }
    }

    this.actor.update({ [`system.abilities.${ability}.rating`]: rating });
  }

  _onAbilityScoreChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const ability = element.closest('.ability-box').dataset.ability;
    const isChecked = element.checked;

    this.actor.update({ [`system.abilities.${ability}.score`]: isChecked ? 1 : 0 });
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system["type"];

    return await Item.create(itemData, {parent: this.actor});
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType) {
      if (dataset.rollType == 'ability') {
        const abilityName = dataset.ability;
        this.actor.rollAbility(abilityName);
      }
    }
  }
}
