-- IMPORTACIÓN MOTEROS DE LA COSTA — 2026-06-22
-- COSTA: 172 | PRADERA: 52

BEGIN;

-- 1. MOTOS
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT86H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML58H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT68H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT87H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT88H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT66H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT72H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT70H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT83H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML56H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT75H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML54H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML47H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML46H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLT84H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML48H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML55H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML52H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML59H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML51H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ94H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML49H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML42H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML53H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML43H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML57H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ98H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLY54H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML45H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ85H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLY52H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLY56H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ96H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ92H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ93H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ97H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ86H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML44H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ90H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ88H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ87H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ91H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ81H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ95H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ77H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML41H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ89H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ83H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML50H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLZ79H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM71H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM70H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM66H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM64H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM68H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM69H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMM72H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMU62H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMU58H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY46H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY88H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMB51H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY17H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY48H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY55H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY53H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY93H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLY45H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY50H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMY52H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMU76H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMW28H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNB18H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RML40H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNK57H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RLY50H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNK56H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNK54H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNN29H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNN72H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNN25H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ44H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ46H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ45H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN81H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN84H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN83H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZO09H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN82H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZO72H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL59H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL64H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL65H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL66H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL62H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL61H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL60H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL63H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU55I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU51I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU52I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU48I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU30I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU40I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW47I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU45I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU38I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU32I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU49I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU60I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU59I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU57I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU54I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU44I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU47I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW61I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW65I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU56I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU50I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU53I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU46I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW33I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU43I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW62I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU42I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF52I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPW63I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF59I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZT91H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL78I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZT89H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL81I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL71I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL77I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL79I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL76I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL67I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL80I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF57I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF60I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL73I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQG94I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL74I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF55I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZZ77H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQG97I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL86I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF56I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAT46H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF58I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQG99I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZZ84H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL84I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ43H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN28H', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU58I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DPU39I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQG96I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQG87I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQL82I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW49I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW53I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW51I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW59I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW56I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW61I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW66I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW62I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW58I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW57I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW65I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW63I', 'AKT', 'NKD 125', 'COSTA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ69H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ67H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ62H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ65H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ60H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ47H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ66H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ48H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ64H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ59H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNG57H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNG53H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNG54H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ46H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNG56H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RNG55H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ58H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ63H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ61H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('RMZ68H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ53H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ47H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ49H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ50H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ51H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ48H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN26H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN24H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN23H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZO26H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN27H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XZN22H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL55H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL57H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL58H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL54H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAL56H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV66H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV69H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV71H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV68H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV73H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAW72H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAW70H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('YAV67H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF54I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DQF53I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DRO38I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('DRO37I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('XYZ54H', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW48I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;
INSERT INTO motos (placa, marca, modelo, grupo, estado, created_at, updated_at)
VALUES ('IEW47I', 'AKT', 'NKD 125', 'PRADERA', 'Asignada', now(), now())
ON CONFLICT (placa) DO UPDATE SET grupo=EXCLUDED.grupo, estado=EXCLUDED.estado;

-- 2. CLIENTES
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANTONIO MERCADO', '9204870', '', '3008525037', false, '3008525037', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '9204870' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS GOMEZ', '23747376', '', '3212445258', false, '3212445258', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '23747376' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MARTHA ALVAREZ PEREZ', '45690540', '', '3008910048', false, '3008910048', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '45690540' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DANIEL MILLAN', '12826728', '', '', false, '', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '12826728' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JORGE BELLO', '73183014', '', '3042827264', false, '3042827264', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73183014' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'WALTER BAHOQUE', '1052735453', '', '3226173761', false, '3226173761', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1052735453' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YESID BARRAZA', '73595786', '', '3006920409', false, '3006920409', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73595786' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS SANDON', '1047480631', '', '3246790739', false, '3246790739', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047480631' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES PADILLA', '', '', '3006323328', false, '3006323328', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DEYLER BANDA', '1007983468', '', '3053078213', false, '3053078213', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007983468' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CARLOS ARIZA', '', '', '3243191534', false, '3243191534', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALEXANDER VILLADIEGO', '73193618', '', '3183861318', false, '3183861318', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73193618' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DILSON DE LA ROSA', '73351730', '', '3180428520', false, '3180428520', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73351730' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'HAROLD LEAL LEAL', '1047499386', '', '3012012498', false, '3012012498', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047499386' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JONER CARDENAS', '1193547648', '', '3127417525', false, '3127417525', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193547648' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CARLOS CASTILLA', '1044920203', '', '3019558361', false, '3019558361', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044920203' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ROBERTO VILLADIEGO', '', '', '3015491881', false, '3015491881', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BRAYAN CADENA', '1001898393', '', '3052127690', false, '3052127690', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001898393' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALBERTO CUADRO', '', '', '3177175288', false, '3177175288', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DARWIN MOLINA', '6192847', '', '3136594652', false, '3136594652', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '6192847' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ISMAEL GAMARRA', '1193596747', '', '3135757738', false, '3135757738', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193596747' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'GERSON TEHERAN', '1002191708', '', '3242049257', false, '3242049257', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002191708' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NIHAYL ARISMENDI', '6063630', '', '3005292127', false, '3005292127', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '6063630' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN CARLOS MORALES', '1047500537', '', '3012724189', false, '3012724189', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047500537' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS DANIEL TOVAR', '4981696', '', '3215468037', false, '3215468037', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '4981696' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHONATAN REYES', '1047380678', '', '3243570127', false, '3243570127', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047380678' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YOINER BERRIO', '1049925977', '', '3505665505', false, '3505665505', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1049925977' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DENILSON IGLESIA', '1002190849', '', '3207030857', false, '3207030857', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002190849' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS MIGUEL SIERRA', '1142914614', '', '3114070592', false, '3114070592', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1142914614' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES BALLESTAS', '1001973328', '', '3205489683', false, '3205489683', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001973328' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EDWIN FONTALVO', '1001976843', '', '3045383077', false, '3045383077', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001976843' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE GOMEZ', '5319000', '', '3212445258', false, '3212445258', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '5319000' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DIEGO MARRUGO', '1043968037', '', '3225342147', false, '3225342147', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043968037' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'STEVENSON ARELLANO', '1192742860', '', '3001586930', false, '3001586930', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1192742860' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRY BREA', '30778276', '', '3245739936', false, '3245739936', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '30778276' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ERLEY BASTOS', '1043655164', '', '3218048153', false, '3218048153', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043655164' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'VICTOR BANQUEZ', '1042578686', '', '3004096806', false, '3004096806', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1042578686' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS ARMANDO MATINEZ', '1010102228', '', '3106817954', false, '3106817954', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1010102228' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MIGUEL ANGEL PADILLA', '1042589041', '', '3018104131', false, '3018104131', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1042589041' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALEXANDER AVILA PALACIO', '1001899559', '', '3145316035', false, '3145316035', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001899559' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN CARLOS OSPINO BRAVO', '', '', '', false, '', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS FELIPE HUERTAS', '1047468762', '', '3159037526', false, '3159037526', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047468762' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES ANTONIO DIAZ', '1047506268', '', '3017345244', false, '3017345244', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047506268' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JAIME MERLANO ESTRADA', '73145362', '', '3136282451', false, '3136282451', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73145362' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YEINER ENRIQUE PEREZ', '1002200028', '', '3016379763', false, '3016379763', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002200028' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALVARO LUIS WILCHES VALERO', '1064709567', '', '3216239199', false, '3216239199', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1064709567' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JEIRU LUIS AURAAD ORTEGA', '1001899079', '', '3135526963', false, '3135526963', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001899079' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MANUEL MERCADO', '1047505481', '', '3001269341', false, '3001269341', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047505481' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MANUEL ENRIQUE CASTRO', '1043295300', '', '3024194157', false, '3024194157', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043295300' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BRAYAN DAVID ROMERO FUENTES', '1043643280', '', '3008048643', false, '3008048643', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043643280' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NILL FABIAN ALCAZAR POLO', '1043647767', '', '3015929517', false, '3015929517', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043647767' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALVARO  VARGAS PINTO', '1063081181', '', '3116578595', false, '3116578595', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1063081181' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'OMAR AGUSTIN RODRIGUEZ BUSTO', '9295689', '', '3004264515', false, '3004264515', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '9295689' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAVID GUTIERREZ MERCADO', '73202818', '', '3026096385', false, '3026096385', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73202818' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ROGER VANEGAS BLANCO', '1047522672', '', '3052892103', false, '3052892103', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047522672' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN CAMILO VALOYES MARTINEZ', '1007978178', '', '3045907831', false, '3045907831', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007978178' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'RAFAEL ANGEL LOPEZ PIÑA', '5773776', '', '3007382564', false, '3007382564', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '5773776' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JULIO CAMARGO MATURANA', '93568642', '', '3505445224', false, '3505445224', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '93568642' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAVID JOSUE BRAZON MARTINEZ', '1043974036', '', '3226890203', false, '3226890203', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043974036' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAIRO ANTONIO ORTEGA MELENDEZ', '1002193827', '', '3016489680', false, '3016489680', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002193827' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JAIME ANDRES ACEVEDO MIRANDA', '1007655658', '', '3043048223', false, '3043048223', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007655658' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EDWIN CABARCA CASTRO', '1128050683', '', '3206083083', false, '3206083083', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1128050683' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JERMIN ZAMBRANO PEREZ', '1043656762', '', '3205229820', false, '3205229820', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043656762' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ARISMEL MUÑOZ', '', '', '', false, '', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JORGE LUIS BENITEZ', '9793330', '', '3001247757', false, '3001247757', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '9793330' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BRYAN BOCANEGRA GARCIA', '1041994929', '', '3249316438', false, '3249316438', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1041994929' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ORLANDO BARRERA VALDELAMAR', '1047485317', '', '3009619976', false, '3009619976', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047485317' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'KEVIN ALEXIS LUNA CARDOZO', '1083047218', '', '3246749589', false, '3246749589', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1083047218' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'KEINER DAVID REYES VALDEZ', '1043972905', '', '3135157330', false, '3135157330', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043972905' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS MIGUEL BERMUDEZ ANGULO', '1043645255', '', '3011632108', false, '3011632108', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043645255' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE VIVANCO', '9201627', '', '3225109307', false, '3225109307', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '9201627' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT '|', '1047411944', '', '3016294725', false, '3016294725', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047411944' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'KEINER ANDRES GOMEZ TORREZ', '1047406625', '', '3012545622', false, '3012545622', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047406625' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHOAN DAVID TORO TORRES', '1041972703', '', '3218309247', false, '3218309247', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1041972703' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DUVIER JOSE OLIVARES', '1047421704', '', '3206062364', false, '3206062364', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047421704' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS MANUEL DUARTES PAEZ', '1002243610', '', '3138733763', false, '3138733763', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002243610' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DEIMAR MURILLO  GOMEZ', '1043653516', '', '3005645781', false, '3005645781', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043653516' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EDUAR RAFAEL LIÑAN BLANCO', '7048499', '', '3206070551', false, '3206070551', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '7048499' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ELKIN  DAVID JIMENEZ CABARCA', '1193367391', '', '3167598930', false, '3167598930', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193367391' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES PEREZ RUIZ', '92446610', '', '3127113637', false, '3127113637', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '92446610' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES HERNANDEZ MARTINEZ', '1143399183', '', '3006515120', false, '3006515120', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143399183' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ADRIAN EDUARDO URSHELA ROA', '1043634473', '', '3006521115', false, '3006521115', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043634473' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANTONIO MARIA BLANCO GOMEZ', '73188450', '', '3016399978', false, '3016399978', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73188450' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BLADIMIR SIMANCA PEREZ', '102060113', '', '3023390149', false, '3023390149', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '102060113' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ARI JESUS POLO ROMAÑA', '1047404800', '', '3018235595', false, '3018235595', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047404800' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JEANPIERE CAMARGO', '1007315275', '', '3016351233', false, '3016351233', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007315275' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YERMIN RODRIGUEZ JULIO', '1007188512', '', '3005486272', false, '3005486272', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007188512' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES CAVADIAS', '1003213534', '', '3044753354', false, '3044753354', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1003213534' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'INDRID  URBINA  JULIO', '1005474338', '', '3134824213', false, '3134824213', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1005474338' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EMERSON MARIMON RUIZ', '1192803530', '', '3016361745', false, '3016361745', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1192803530' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALBERT DEL CRISTO BOLIVAR', '1128053238', '', '3044533107', false, '3044533107', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1128053238' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS MALDONADO RODRIGUEZ', '1007314164', '', '3215359494', false, '3215359494', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007314164' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BRADER GUZMAN WATSON', '1048438895', '', '3053730377', false, '3053730377', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048438895' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CARLOS HERRERA APARICIO', '1048439273', '', '3001454665', false, '3001454665', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048439273' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS MIGUEL JIMENES MORELO', '1047481206', '', '3043194235', false, '3043194235', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047481206' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'SANTIAGO SERRANO', '1043975316', '', '3052620747', false, '3052620747', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043975316' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YONAIKER MONTAÑO', '1127588315', '', '3147082361', false, '3147082361', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1127588315' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MANUEL CASTRO MONTERO', '1043295300', '', '3024421027', false, '3024421027', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043295300' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANICASIO TOVAR  ECHEVERRIA', '73210264', '', '3148901346', false, '3148901346', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73210264' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NESTOR MOLINA ALTAMIRANDA', '1047431896', '', '3011956695', false, '3011956695', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047431896' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'RAFAEL ARNEDO GOMEZ', '1047420574', '', '3004494588', false, '3004494588', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047420574' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAIRO GOMEZ MORENO', '1063141999', '', '3043624871', false, '3043624871', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1063141999' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JONATHAN KENDRI VILLALOBOS', '3388231', '', '3008435641', false, '3008435641', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '3388231' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS EDUARDO VILLALBA  TALAIGUA', '1043643903', '', '3234137714', false, '3234137714', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043643903' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JORK DAVIS TURIZO PEREIRA', '1001979646', '', '3014516627', false, '3014516627', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001979646' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'SANTIAGO ELIAS BETANCOURT PEREZ', '1043641421', '', '3046043832', false, '3046043832', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043641421' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHONATAN ALEXANDER CANO RAMIREZ', '1002198925', '', '3137931430', false, '3137931430', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002198925' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'RODYS ENRIQUE OQUENDO OLAVE', '1047366402', '', '3014000069', false, '3014000069', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047366402' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUISA MARIA GARCIA OBESO', '45483937', '', '3005589836', false, '3005589836', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '45483937' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHON JAIRO SUAREZ PERTUZ', '1047494355', '', '3043798467', false, '3043798467', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047494355' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'HUGO ARMANDO VARON TEHERAN', '1043965939', '', '3122331070', false, '3122331070', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043965939' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EVER LUIS DE ARCO HERNADEZ', '1049831571', '', '3001462030', false, '3001462030', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1049831571' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MAURICIO DE JESUS TORRES CUENTAS', '1235046344', '', '3006167563', false, '3006167563', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1235046344' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'KATTY VILLALOBOS CORDOBA', '1129535793', '', '3245963789', false, '3245963789', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1129535793' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'HERNESTO LUIS VANEGAS RODRIGUEZ', '1001904481', '', '3008811842', false, '3008811842', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001904481' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE MANUEL ESTRADA CUADRO', '1007970996', '', '3147947371', false, '3147947371', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007970996' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAURIS SIBAJA BARBERO', '1047458058', '', '3188795253', false, '3188795253', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047458058' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MARLON MUÑOZ MENDOZA', '73203618', '', '3243158111', false, '3243158111', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73203618' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JONATHAN FERNANDEZ ORDOÑEZ', '1002249686', '', '3246440320', false, '3246440320', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002249686' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS MARIO PUELLO LAGUNA', '1043655058', '', '3013758140', false, '3013758140', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043655058' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DANIEL ZUÑIGA RAMOS', '1002507941', '', '3232383590', false, '3232383590', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002507941' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BERNARDO DE JESUS POLO ORTEGA', '1048436667', '', '3245152998', false, '3245152998', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048436667' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ELKIN CARDALES JULIO', '1143324577', '', '3243750217', false, '3243750217', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143324577' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ELIO OBED QUIROGA MONTES', '1143398459', '', '3224926935', false, '3224926935', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143398459' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MANUEL QUINTERO CARDENAS', '13567376', '', '3124188790', false, '3124188790', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '13567376' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JEAN CARLOS LIPEDA DIAZ', '1047386619', '', '3019010979', false, '3019010979', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047386619' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHOELFONTALVO ARROYO', '1042583945', '', '3043922163', false, '3043922163', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1042583945' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MARLON BERRIO PETTERSON', '1047384723', '', '3018540159', false, '3018540159', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047384723' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'SANDER CORTES FLOREZ', '1047458868', '', '3188430390', false, '3188430390', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047458868' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JEAMPIERRE GARCES JULIO', '1053127468', '', '3045296691', false, '3045296691', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1053127468' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LIBINTON  PATERNINA PATERNINA', '73005878', '', '3014296988', false, '3014296988', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73005878' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CARLOS MIRANDA MALLARINO', '7918889', '', '3135453173', false, '3135453173', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '7918889' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE RAMIREZ BERRIO', '1001971137', '', '3005777409', false, '3005777409', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001971137' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JORGE ZABALETA CASTRO', '1047422552', '', '3008465971', false, '3008465971', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047422552' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE GUILLERMO ORTIZ LOPEZ', '1049582611', '', '3225902543', false, '3225902543', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1049582611' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANTONIO JOSE PEINADO JULIO', '6880641', '', '3207696106', false, '3207696106', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '6880641' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN CAMILO SANTANA BERRIO', '1001902369', '', '3242110765', false, '3242110765', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001902369' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CRISTIAN DAVID PACHECO RIPOLL', '1044914466', '', '3116070065', false, '3116070065', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044914466' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'IVAN CASTILLO EMERY', '1002247147', '', '3238339674', false, '3238339674', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002247147' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MARCELINO GELEZ BUELBAS', '3798937', '', '3113824619', false, '3113824619', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '3798937' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAYSI BELTRAN GOMEZ', '22803860', '', '3006079635', false, '3006079635', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '22803860' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHONNY DE JESUS OLIVERO ACUÑA', '12598057', '', '3042718615', false, '3042718615', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '12598057' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ROBERTO AGAMEZ PEREZ', '1048442298', '', '3226916399', false, '3226916399', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048442298' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MIGUEL ANGEL MERGAREJO BARON', '1001975527', '', '3216458459', false, '3216458459', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001975527' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JEYNER ANTONIO RICARDO SUAREZ', '1193530540', '', '3106397253', false, '3106397253', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193530540' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS ANGEL GOMEZ GOMEZ', '5337746', '', '3148236412', false, '3148236412', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '5337746' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'WILFRAN JAVIER RICARDO VALDEZ', '1007739575', '', '3243434034', false, '3243434034', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007739575' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE DEL CARMEN DIAZ SANMARTIN', '1051444610', '', '3043300362', false, '3043300362', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1051444610' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'HOLMAN DAVID MARRUGO CASTRO', '1049825542', '', '3106810672', false, '3106810672', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1049825542' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YEINER RICARDO SUAREZ', '1193530540', '', '30227817948', false, '30227817948', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193530540' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN DAVID CASTILLA PADILLA', '1007955120', '', '3116985540', false, '3116985540', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007955120' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JULIO CESAR MIRANDA URIBE', '1047366400', '', '3244010972', false, '3244010972', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047366400' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANDRES FELIPE ESPINOZA HERNANDEZ', '1050944469', '', '3015695575', false, '3015695575', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1050944469' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS ALBERTO BLANCO SARATE', '1047451679', '', '3025077226', false, '3025077226', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047451679' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CRISTIAN ANAYA', '1235039690', '', '3017343058', false, '3017343058', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1235039690' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'GEOVANNY CABARCAS', '73206419', '', '3126568517', false, '3126568517', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73206419' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'OSCAR PUELLO VASQUEZ', '1143337147', '', '3013933372', false, '3013933372', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143337147' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MEDARDO JOSE CAÑATE DIAZ', '1007972537', '', '3233744799', false, '3233744799', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007972537' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ERICK ELIECER RODRIGUEZ GUZMAN', '1001967587', '', '3126544235', false, '3126544235', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001967587' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'AGUSTIN TOVAR MIRANDA', '1047417288', '', '3504423361', false, '3504423361', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047417288' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'WILLIS BERRIO SOTO', '1001968594', '', '3145908058', false, '3145908058', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001968594' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'REINALDO ANTONIO RODRIGUEZ SANCHEZ', '1238354850', '', '3204901939', false, '3204901939', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1238354850' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOEL ANTONIO AULAR PONCE', '8259323', '', '3046740837', false, '3046740837', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '8259323' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'OSNAYDER CAÑATE PAJARO', '1044915560', '', '3044324679', false, '3044324679', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044915560' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'RAUL GOMEZ SAN MARTIN', '1010022705', '', '3148896367', false, '3148896367', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1010022705' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LEANDRIS CASTILLA HERRERA', '1044906417', '', '3004594797', false, '3004594797', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044906417' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'OLAGIVER LLERENA CORREA', '1044927760', '', '3233608276', false, '3233608276', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044927760' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS ALBERTO MUÑOZ GUZMAN', '1007575024', '', '3001449693', false, '3001449693', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007575024' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EDINSON MOSQUERA BORJA', '82140238', '', '3206702670', false, '3206702670', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '82140238' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ERIKA CARABALLO PALACIO', '45523708', '', '3137884684', false, '3137884684', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '45523708' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANTONIO MONTERROZA JULIO', '1044920690', '', '3145821862', false, '3145821862', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044920690' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'FERNANDO MANUEL DE ORO RICARDO', '73435800', '', '3013163117', false, '3013163117', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73435800' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS ALBERTO BAYONA', '1094576716', '', '3147297903', false, '3147297903', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1094576716' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS DANIEL RAMOS SANCHEZ', '1043296481', '', '3015843363', false, '3015843363', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043296481' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'SIMON CORREA CANTILLO', '1002413469', '', '3503566885', false, '3503566885', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002413469' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'WILFRIDO ESTRADA YEPES', '1047406625', '', '3012545622', false, '3012545622', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047406625' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ALEJANDRO NIETO CASERES', '9293484', '', '3126842744', false, '3126842744', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '9293484' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DANIEL FERNANDO NIÑO PEREZ', '1043641970', '', '3233141374', false, '3233141374', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043641970' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JUAN FRANCISCO MEDELLIN', '1148706563', '', '3015580047', false, '3015580047', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1148706563' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DURIS MANUEL GONZALES MURILLO', '1193495942', '', '3014865928', false, '3014865928', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1193495942' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DELCY JUDITH YEPES OCHOA', '45762317', '', '3215046200', false, '3215046200', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '45762317' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ANGEL GUILLEN OLIVERO', '30162562', '', '3019852529', false, '3019852529', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '30162562' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NELSI DEL CARMEN HERRERA OTERO', '45691097', '', '3145958389', false, '3145958389', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '45691097' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DANIEL DIAZ CARDONA', '6706627', '', '3151572933', false, '3151572933', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '6706627' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JULIO ANTONIO SAYAS LIDUEÑA', '73215995', '', '3134136483', false, '3134136483', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '73215995' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'MANUEL RAMON MORELO', '11165463', '', '3207685500', false, '3207685500', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '11165463' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHONNIER MOYAR IRIARTE', '1007955046', '', '3018681600', false, '3018681600', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007955046' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'PETRONA GONZALEZ GALLEGO', '1002200805', '', '3216512758', false, '3216512758', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002200805' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NELSON ESTUPIÑAN', '', '', '3044812032', false, '3044812032', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS DAVID JIMENEZ', '', '', '3002053692', false, '3002053692', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DEIMER BERRIO', '11239914', '', '3243923636', false, '3243923636', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '11239914' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE LUIS LOPEZ PONCE', '', '', '', false, '', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'NEIVER CASTILLA', '1001969412', '', '3012755856', false, '3012755856', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001969412' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JAINER SMITH HERRERA RODRIQUEZ', '1048441605', '', '3108339603', false, '3108339603', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048441605' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS EDUARDO VEGA VILLEGAS', '1052067538', '', '3011655094', false, '3011655094', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1052067538' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JADER OROZCO PUENTE', '1143348234', '', '3218205176', false, '3218205176', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143348234' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BLEIMER LUIS CASTELLANO', '1149445105', '', '3045629148', false, '3045629148', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1149445105' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOSE MANUEL VILLANUEVA', '23739639', '', '3044623792', false, '3044623792', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '23739639' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS DAVID GUARDIA', '1148434248', '', '3244420456', false, '3244420456', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1148434248' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LEIDER PALACIO PUELLO', '1052730741', '', '3233342450', false, '3233342450', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1052730741' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YERLIS HELENA QUINTERO', '147392607', '', '3001450825', false, '3001450825', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '147392607' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS FERNANDO SILGADO', '1127601596', '', '3042473576', false, '3042473576', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1127601596' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHON BOLAÑO MONTEROZA', '1043648573', '', '3226314125', false, '3226314125', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043648573' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LINETH CASTELLAR CASTELLAR', '1047414602', '', '3116941650', false, '3116941650', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047414602' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JAIDER HERNANDEZ VARGAS', '1007973420', '', '3008737900', false, '3008737900', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007973420' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CAMILO BERROCAL GARCIA', '1043648649', '', '3014898441', false, '3014898441', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1043648649' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'VICTOR RAMOS GONZALES', '1001968606', '', '3011813476', false, '3011813476', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001968606' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YAIR DIAZ PEREZ', '1142916239', '', '300649287', false, '300649287', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1142916239' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EFREN ORTEGA ROMERO', '1048439218', '', '3116694585', false, '3116694585', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1048439218' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS DAVID SABALLET LLERENA', '1044906992', '', '3235369651', false, '3235369651', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044906992' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'EVER HERNANDEZ', '1045501307', '', '3022376424', false, '3022376424', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1045501307' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'LUIS CARLOS ORDOÑEZ', '1007963038', '', '3127097429', false, '3127097429', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1007963038' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CRISTIAN AGUIRRE DIAZ', '1047503883', '', '3023524794', false, '3023524794', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047503883' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'DAVID PEREZ GONZALES', '1047399688', '', '3245180950', false, '3245180950', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047399688' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'ADALBERTO TORRRES DE AVILA', '1143402332', '', '3225701586', false, '3225701586', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143402332' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JOEL MEJIA RUIZ', '1044933402', '', '3015507218', false, '3015507218', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1044933402' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JESUS DAVID LEON CASTELLANO', '1143351337', '', '3137058622', false, '3137058622', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1143351337' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'YORDIS CARABALLO MARTINEZ', '1047486586', '', '3235320647', false, '3235320647', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1047486586' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'BLADIMIR JESUS HERRERA BETANCOUTK', '30739474', '', '3243921948', false, '3243921948', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '30739474' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CLAUDIO ARNEDO GOMEZ', '1050959244', '', '3011132324', false, '3011132324', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1050959244' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CRISTIAN VIDALES SAUCEDO', '1002184456', '', '3007286790', false, '3007286790', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1002184456' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JAVIER JESUS POSSO SALAZAR', '1001970856', '', '3135496935', false, '3135496935', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1001970856' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'CARLOS ALFREDO NAVARRO RIOS', '112862098', '', '3045346301', false, '3045346301', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '112862098' AND cedula <> '');
INSERT INTO clientes (nombre, cedula, direccion, telefono, mismo_whatsapp, whatsapp, estado, excepcion_documental, documentos_cliente, documentos_acompanante, created_at, updated_at)
SELECT 'JHEINER ANDRES PALOMINO SALAS', '1015470975', '', '3145450770', false, '3145450770', 'Activo', false, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, '{"cedula":{"ok":false,"file":null},"licencia":{"ok":false,"file":null},"recibo1":{"ok":false,"file":null},"recibo2":{"ok":false,"file":null},"carta":{"ok":false,"file":null},"antecedentes":{"ok":false,"file":null},"hojaVida":{"ok":false,"file":null}}'::jsonb, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cedula = '1015470975' AND cedula <> '');

-- 3. CONTRATOS
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '9204870'
WHERE m.placa='RLT86H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '23747376'
WHERE m.placa='RML58H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '45690540'
WHERE m.placa='RLT68H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-03', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '12826728'
WHERE m.placa='RLT87H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-08-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73183014'
WHERE m.placa='RLT88H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 201000, 28714, 14357, 500000, 24, 500000, 0, false, '2025-08-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1052735453'
WHERE m.placa='RLT66H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 234000, 33429, 16714, 800000, 15, 800000, 0, false, '2025-08-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73595786'
WHERE m.placa='RLT72H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-03', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047480631'
WHERE m.placa='RLT70H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 200000, 24, 200000, 0, false, '2025-08-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'ANDRES PADILLA'
WHERE m.placa='RLT83H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007983468'
WHERE m.placa='RML56H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 605000, 24, 605000, 0, false, '2025-08-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'CARLOS ARIZA'
WHERE m.placa='RLT75H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73193618'
WHERE m.placa='RML54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73351730'
WHERE m.placa='RML47H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2025-08-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047499386'
WHERE m.placa='RML46H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193547648'
WHERE m.placa='RLT84H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2025-08-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044920203'
WHERE m.placa='RML48H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'ROBERTO VILLADIEGO'
WHERE m.placa='RML55H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001898393'
WHERE m.placa='RML52H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'ALBERTO CUADRO'
WHERE m.placa='RML59H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-20', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '6192847'
WHERE m.placa='RML51H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-23', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193596747'
WHERE m.placa='RLZ94H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-23', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002191708'
WHERE m.placa='RML49H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-23', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '6063630'
WHERE m.placa='RML42H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-23', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047500537'
WHERE m.placa='RML53H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '4981696'
WHERE m.placa='RML43H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 300000, 24, 300000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047380678'
WHERE m.placa='RML57H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1049925977'
WHERE m.placa='RLZ98H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002190849'
WHERE m.placa='RLY54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1142914614'
WHERE m.placa='RML45H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 245000, 35000, 17500, 300000, 24, 300000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001973328'
WHERE m.placa='RLZ85H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001976843'
WHERE m.placa='RLY52H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 234000, 33429, 16714, 800000, 24, 800000, 0, false, '2025-08-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '5319000'
WHERE m.placa='RLY56H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-08-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043968037'
WHERE m.placa='RLZ96H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1192742860'
WHERE m.placa='RLZ92H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '30778276'
WHERE m.placa='RLZ93H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043655164'
WHERE m.placa='RLZ97H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 300000, 24, 300000, 0, false, '2025-08-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1042578686'
WHERE m.placa='RLZ86H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1010102228'
WHERE m.placa='RML44H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 350000, 24, 350000, 0, false, '2025-08-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1042589041'
WHERE m.placa='RLZ90H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001899559'
WHERE m.placa='RLZ88H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'JUAN CARLOS OSPINO BRAVO'
WHERE m.placa='RLZ87H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047468762'
WHERE m.placa='RLZ91H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047506268'
WHERE m.placa='RLZ81H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-08-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73145362'
WHERE m.placa='RLZ95H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002200028'
WHERE m.placa='RLZ77H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 390000, 55714, 27857, 500000, 24, 500000, 0, false, '2025-09-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1064709567'
WHERE m.placa='RML41H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 196000, 28000, 14000, 500000, 24, 500000, 0, false, '2025-09-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001899079'
WHERE m.placa='RLZ89H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-08-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047505481'
WHERE m.placa='RLZ83H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 350000, 24, 350000, 0, false, '2025-09-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043295300'
WHERE m.placa='RML50H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043643280'
WHERE m.placa='RLZ79H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043647767'
WHERE m.placa='RMM71H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1063081181'
WHERE m.placa='RMM70H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 420000, 60000, 30000, 500000, 24, 500000, 0, false, '2025-09-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '9295689'
WHERE m.placa='RMM66H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-09-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73202818'
WHERE m.placa='RMM64H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-09-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047522672'
WHERE m.placa='RMM68H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007978178'
WHERE m.placa='RMM69H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '5773776'
WHERE m.placa='RMM72H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '93568642'
WHERE m.placa='RMU62H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-09-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043974036'
WHERE m.placa='RMU58H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002193827'
WHERE m.placa='RMY46H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007655658'
WHERE m.placa='RMY88H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1128050683'
WHERE m.placa='RMB51H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043656762'
WHERE m.placa='RMY17H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'ARISMEL MUÑOZ'
WHERE m.placa='RMY48H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '9793330'
WHERE m.placa='RMY55H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1041994929'
WHERE m.placa='RMY53H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047485317'
WHERE m.placa='RMY93H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-08', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1083047218'
WHERE m.placa='RLY45H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043972905'
WHERE m.placa='RMY50H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043645255'
WHERE m.placa='RMY52H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 302000, 24, 302000, 0, false, '2025-09-29', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '9201627'
WHERE m.placa='RMU76H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047411944'
WHERE m.placa='RMW28H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047406625'
WHERE m.placa='RNB18H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1041972703'
WHERE m.placa='RML40H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047421704'
WHERE m.placa='RNK57H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002243610'
WHERE m.placa='RLY50H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-11-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043653516'
WHERE m.placa='RNK56H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-11-04', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '7048499'
WHERE m.placa='RNK54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-11-08', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193367391'
WHERE m.placa='RNN29H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-11-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '92446610'
WHERE m.placa='RNN72H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 420000, 60000, 30000, 725000, 24, 725000, 0, false, '2025-11-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143399183'
WHERE m.placa='RNN25H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043634473'
WHERE m.placa='XYZ44H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73188450'
WHERE m.placa='XYZ46H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '102060113'
WHERE m.placa='XYZ45H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-01-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047404800'
WHERE m.placa='XZN81H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007315275'
WHERE m.placa='XZN84H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007188512'
WHERE m.placa='XZN83H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1003213534'
WHERE m.placa='XZO09H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 900000, 24, 900000, 0, false, '2026-01-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1005474338'
WHERE m.placa='XZN82H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1192803530'
WHERE m.placa='XZO72H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1128053238'
WHERE m.placa='YAL59H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007314164'
WHERE m.placa='YAL64H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048438895'
WHERE m.placa='YAL65H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048439273'
WHERE m.placa='YAL66H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047481206'
WHERE m.placa='YAL62H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043975316'
WHERE m.placa='YAL61H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1127588315'
WHERE m.placa='YAL60H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-02-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043295300'
WHERE m.placa='YAL63H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73210264'
WHERE m.placa='DPU55I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047431896'
WHERE m.placa='DPU51I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047420574'
WHERE m.placa='DPU52I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1063141999'
WHERE m.placa='DPU48I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '3388231'
WHERE m.placa='DPU30I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043643903'
WHERE m.placa='DPU40I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001979646'
WHERE m.placa='DPW47I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043641421'
WHERE m.placa='DPU45I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002198925'
WHERE m.placa='DPU38I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047366402'
WHERE m.placa='DPU32I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '45483937'
WHERE m.placa='DPU49I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047494355'
WHERE m.placa='DPU60I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043965939'
WHERE m.placa='DPU59I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1049831571'
WHERE m.placa='DPU57I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 800000, 15, 800000, 0, false, '2026-03-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1235046344'
WHERE m.placa='DPU54I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1129535793'
WHERE m.placa='DPU44I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 456000, 24, 456000, 0, false, '2026-03-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001904481'
WHERE m.placa='DPU47I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-18', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007970996'
WHERE m.placa='DPW61I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 400000, 24, 400000, 0, false, '2026-03-18', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047458058'
WHERE m.placa='DPW65I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-19', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73203618'
WHERE m.placa='DPU56I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-18', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002249686'
WHERE m.placa='DPU50I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043655058'
WHERE m.placa='DPU53I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-21', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002507941'
WHERE m.placa='DPU46I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 870000, 124286, 62143, 1380000, 24, 1380000, 0, false, '2026-03-21', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048436667'
WHERE m.placa='DPW33I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-21', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143324577'
WHERE m.placa='DPU43I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-24', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143398459'
WHERE m.placa='DPW62I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-24', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '13567376'
WHERE m.placa='DPU42I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047386619'
WHERE m.placa='DQF52I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1042583945'
WHERE m.placa='DPW63I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047384723'
WHERE m.placa='DQF59I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047458868'
WHERE m.placa='XZT91H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1053127468'
WHERE m.placa='DQL78I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-30', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73005878'
WHERE m.placa='XZT89H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-31', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '7918889'
WHERE m.placa='DQL81I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-31', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001971137'
WHERE m.placa='DQL71I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-01', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047422552'
WHERE m.placa='DQL77I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1049582611'
WHERE m.placa='DQL79I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '6880641'
WHERE m.placa='DQL76I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001902369'
WHERE m.placa='DQL67I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044914466'
WHERE m.placa='DQL80I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 155000, 24, 155000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002247147'
WHERE m.placa='DQF57I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 868000, 124000, 62000, 310000, 24, 310000, 0, false, '2026-04-08', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '3798937'
WHERE m.placa='DQF60I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '22803860'
WHERE m.placa='DQL73I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '12598057'
WHERE m.placa='DQG94I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048442298'
WHERE m.placa='DQL74I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001975527'
WHERE m.placa='DQF55I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193530540'
WHERE m.placa='XZZ77H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '5337746'
WHERE m.placa='DQG97I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007739575'
WHERE m.placa='DQL86I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1051444610'
WHERE m.placa='DQF56I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1049825542'
WHERE m.placa='YAT46H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193530540'
WHERE m.placa='DQF58I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007955120'
WHERE m.placa='DQG99I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-18', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047366400'
WHERE m.placa='XZZ84H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-20', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1050944469'
WHERE m.placa='DQL84I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047451679'
WHERE m.placa='XYZ43H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-01-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1235039690'
WHERE m.placa='XZN28H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73206419'
WHERE m.placa='DPU58I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-03-26', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143337147'
WHERE m.placa='DPU39I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-31', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007972537'
WHERE m.placa='DQG96I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001967587'
WHERE m.placa='DQG87I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-14', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047417288'
WHERE m.placa='DQL82I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001968594'
WHERE m.placa='IEW49I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 450000, 24, 450000, 0, false, '2026-06-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1238354850'
WHERE m.placa='IEW53I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 50000, 7143, 3571, 510000, 24, 510000, 0, false, '2026-06-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '8259323'
WHERE m.placa='IEW51I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044915560'
WHERE m.placa='IEW59I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1010022705'
WHERE m.placa='IEW56I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 50000, 7143, 3571, 510000, 24, 510000, 0, false, '2026-05-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044906417'
WHERE m.placa='IEW61I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044927760'
WHERE m.placa='IEW66I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007575024'
WHERE m.placa='IEW62I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '82140238'
WHERE m.placa='IEW58I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '45523708'
WHERE m.placa='IEW57I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 300000, 24, 300000, 0, false, '2026-06-17', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044920690'
WHERE m.placa='IEW65I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-18', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73435800'
WHERE m.placa='IEW63I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1094576716'
WHERE m.placa='RMZ69H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043296481'
WHERE m.placa='RMZ67H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002413469'
WHERE m.placa='RMZ62H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-14', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047406625'
WHERE m.placa='RMZ65H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'diario', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '9293484'
WHERE m.placa='RMZ60H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043641970'
WHERE m.placa='RMZ47H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-11', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1148706563'
WHERE m.placa='RMZ66H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'mensual', 'Lunes', 840000, 120000, 60000, 500000, 24, 500000, 0, false, '2025-10-14', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1193495942'
WHERE m.placa='RMZ48H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-14', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '45762317'
WHERE m.placa='RMZ64H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-17', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '30162562'
WHERE m.placa='RMZ59H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '45691097'
WHERE m.placa='RNG57H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '6706627'
WHERE m.placa='RNG53H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '73215995'
WHERE m.placa='RNG54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '11165463'
WHERE m.placa='RMZ46H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007955046'
WHERE m.placa='RNG56H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-25', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002200805'
WHERE m.placa='RNG55H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'NELSON ESTUPIÑAN'
WHERE m.placa='RMZ58H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 416000, 24, 416000, 0, false, '2025-10-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'LUIS DAVID JIMENEZ'
WHERE m.placa='RMZ63H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-20', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '11239914'
WHERE m.placa='RMZ61H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-10-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.nombre = 'JOSE LUIS LOPEZ PONCE'
WHERE m.placa='RMZ68H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001969412'
WHERE m.placa='XYZ53H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048441605'
WHERE m.placa='XYZ47H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1052067538'
WHERE m.placa='XYZ49H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 195000, 27857, 13929, 450000, 24, 450000, 0, false, '2025-12-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143348234'
WHERE m.placa='XYZ50H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 400000, 24, 400000, 0, false, '2025-12-09', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1149445105'
WHERE m.placa='XYZ51H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2025-12-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '23739639'
WHERE m.placa='XYZ48H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1148434248'
WHERE m.placa='XZN26H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 195000, 27857, 13929, 500000, 24, 500000, 0, false, '2026-01-14', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1052730741'
WHERE m.placa='XZN24H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '147392607'
WHERE m.placa='XZN23H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1127601596'
WHERE m.placa='XZO26H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-16', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043648573'
WHERE m.placa='XZN27H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-01-31', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047414602'
WHERE m.placa='XZN22H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-02-06', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007973420'
WHERE m.placa='YAL55H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1043648649'
WHERE m.placa='YAL57H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001968606'
WHERE m.placa='YAL58H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 1000000, 24, 1000000, 0, false, '2026-02-10', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1142916239'
WHERE m.placa='YAL54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1048439218'
WHERE m.placa='YAL56H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044906992'
WHERE m.placa='YAV66H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-27', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1045501307'
WHERE m.placa='YAV69H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1007963038'
WHERE m.placa='YAV71H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047503883'
WHERE m.placa='YAV68H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-02-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047399688'
WHERE m.placa='YAV73H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143402332'
WHERE m.placa='YAW72H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-05', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1044933402'
WHERE m.placa='YAW70H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-03-20', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1143351337'
WHERE m.placa='YAV67H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-07', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1047486586'
WHERE m.placa='DQF54I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Miércoles', 202000, 28857, 14429, 500000, 24, 500000, 0, false, '2026-04-15', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '30739474'
WHERE m.placa='DQF53I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-05-02', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1050959244'
WHERE m.placa='DRO38I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-04-28', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1002184456'
WHERE m.placa='DRO37I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'diario', 'Lunes', 50000, 7143, 3571, 150000, 24, 150000, 0, false, '2026-05-13', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1001970856'
WHERE m.placa='XYZ54H' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-12', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '112862098'
WHERE m.placa='IEW48I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');
INSERT INTO contratos (moto_id, cliente_id, tipo_contrato, dia_pago, valor_semanal, tarifa_diaria, tarifa_domingo, base_inicial, meses, ahorro_inicial, ahorro_acumulado, base_completada, fecha_entrega, estado, created_at)
SELECT m.id, cl.id, 'semanal', 'Lunes', 202000, 28857, 14429, 510000, 24, 510000, 0, false, '2026-06-20', 'Activo', now()
FROM motos m JOIN clientes cl ON cl.cedula = '1015470975'
WHERE m.placa='IEW47I' AND NOT EXISTS (SELECT 1 FROM contratos ex WHERE ex.moto_id=m.id AND ex.estado='Activo');

COMMIT;

SELECT 'Motos' as tabla, COUNT(*) as total FROM motos WHERE grupo IN ('COSTA','PRADERA')
UNION ALL SELECT 'Clientes', COUNT(*) FROM clientes WHERE estado='Activo'
UNION ALL SELECT 'Contratos activos', COUNT(*) FROM contratos WHERE estado='Activo';
