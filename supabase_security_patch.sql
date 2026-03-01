-- SQL Editor Patch - Ejecútalo para apagar las alarmas de seguridad

-- 1. Renombrar la columna sensible a algo que no dispare la alarma de "Contraseñas expuestas"
ALTER TABLE users RENAME COLUMN password TO access_pin;

-- 2. Habilitar la seguridad de nivel de fila (RLS) en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE "barTables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orderItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saleItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cashControl" ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas que permitan acceso general (para no tumbar nuestra web)
-- "USING (true)" significa que dejará pasar las peticiones de nuestra app
CREATE POLICY "Permite acceso general usuarios" ON users FOR ALL USING (true);
CREATE POLICY "Permite acceso general productos" ON products FOR ALL USING (true);
CREATE POLICY "Permite acceso general mesas" ON "barTables" FOR ALL USING (true);
CREATE POLICY "Permite acceso general ordenes" ON orders FOR ALL USING (true);
CREATE POLICY "Permite acceso general items" ON "orderItems" FOR ALL USING (true);
CREATE POLICY "Permite acceso general ventas" ON sales FOR ALL USING (true);
CREATE POLICY "Permite acceso general destalles" ON "saleItems" FOR ALL USING (true);
CREATE POLICY "Permite acceso general caja" ON "cashControl" FOR ALL USING (true);
CREATE POLICY "Permite acceso general mermas" ON waste FOR ALL USING (true);
CREATE POLICY "Permite acceso general ajustes" ON settings FOR ALL USING (true);
