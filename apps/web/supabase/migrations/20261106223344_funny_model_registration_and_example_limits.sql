-- Retired registrations stay in the audit history. Only current ones reserve a model ID.
create unique index funny_models_current_model_id
  on private.funny_models (model_id) where not retired;

alter table private.funny_models
  drop constraint funny_models_model_id_key;

alter table private.funny_examples
  drop constraint funny_examples_image_description_check,
  add constraint funny_examples_image_description_check
    check (length(btrim(image_description)) between 3 and 1500);
