USE planyourfit;

ALTER TABLE users ADD COLUMN IF NOT EXISTS default_postal_code VARCHAR(6) NULL AFTER default_location;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6) NULL AFTER location_address;
