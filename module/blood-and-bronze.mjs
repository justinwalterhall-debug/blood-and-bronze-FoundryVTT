import { BloodAndBronzeActor } from "./documents/actor.mjs";
import { BloodAndBronzeItem } from "./documents/item.mjs";
import { BloodAndBronzeActorSheet } from "./sheets/actor-sheet.mjs";
import { BloodAndBronzeItemSheet } from "./sheets/item-sheet.mjs";

Hooks.once('init', async function() {
  console.log('Blood & Bronze | Initializing System');

  game.bloodandbronze = {
    BloodAndBronzeActor,
    BloodAndBronzeItem
  };

  CONFIG.Actor.documentClass = BloodAndBronzeActor;
  CONFIG.Item.documentClass = BloodAndBronzeItem;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("blood-and-bronze", BloodAndBronzeActorSheet, {
    makeDefault: true,
    label: "Blood & Bronze Character Sheet"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("blood-and-bronze", BloodAndBronzeItemSheet, {
    makeDefault: true,
    label: "Blood & Bronze Item Sheet"
  });

  // Preload Handlebars templates
  return loadTemplates([
    "systems/blood-and-bronze/templates/actor/parts/actor-abilities.hbs",
    "systems/blood-and-bronze/templates/actor/parts/actor-equipment.hbs",
    "systems/blood-and-bronze/templates/actor/parts/actor-covenants.hbs"
  ]);
});

Hooks.once('ready', async function() {
  console.log('Blood & Bronze | System Ready');
});