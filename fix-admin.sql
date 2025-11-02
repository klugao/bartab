-- Script para tornar eduardo.klug7@gmail.com administrador
-- Execute com: psql -U pdv -d pdv_dev -f fix-admin.sql

-- 1. Atualizar role do usuário para Administrador
UPDATE users 
SET role = 'AdministradorSistema' 
WHERE email = 'eduardo.klug7@gmail.com';

-- 2. Aprovar o estabelecimento automaticamente
UPDATE establishments 
SET "statusAprovacao" = 'Aprovado' 
WHERE id IN (
    SELECT establishment_id 
    FROM users 
    WHERE email = 'eduardo.klug7@gmail.com'
);

-- 3. Verificar as mudanças
SELECT 
    u.email, 
    u.role, 
    e.name as estabelecimento, 
    e."statusAprovacao" as status
FROM users u
JOIN establishments e ON u.establishment_id = e.id
WHERE u.email = 'eduardo.klug7@gmail.com';

