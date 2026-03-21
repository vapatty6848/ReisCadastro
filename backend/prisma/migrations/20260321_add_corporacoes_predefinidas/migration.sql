-- AddColumn para armazenar se corporação é predefinida
ALTER TABLE "Corporacao" ADD COLUMN "isPredefinida" BOOLEAN NOT NULL DEFAULT false;

-- Inserir corporações predefinidas
INSERT INTO "Corporacao" (id, nome, telefone, "isPredefinida", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'EM Dr Getúlio Vargas', '11-0000-0000', true, NOW(), NOW()),
  (gen_random_uuid(), 'Banda Marcial de Tapirai', '11-0000-0000', true, NOW(), NOW()),
  (gen_random_uuid(), 'Fanfarra de Tapirai', '11-0000-0000', true, NOW(), NOW()),
  (gen_random_uuid(), 'EM Prof. Flávio de Souza Nogueira', '11-0000-0000', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
