-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 206 — LA PRIMERA CUOTA DEL ACUERDO SE GUARDA AL FIRMAR, Y LA FECHA LÍMITE SE CUENTA DESDE AHÍ
--        (27-oct-2026, D-056; aprobado por el dueño: «Sí, apruebo los 4 puntos»)
--
-- LO QUE PASÓ: la nómina de Carlos Ariza pagaba como atrasadas las semanas de DQL76I (EVER LUIS DE
-- LA ROSA) aunque pagó completo cada lunes. La nómina contaba las cuotas del acuerdo desde la firma
-- sin saltar la semana del prorrateo; Cartera sí la salta. Y la fecha límite se calculaba igual que
-- la nómina: a 72 de 171 acuerdos les quedó una semana antes de su última cuota real, y
-- `marcar_convenios_vencidos()` dejó 11 como INCUMPLIDOS el 27-oct cuando su última cuota es el 2-nov.
--
-- LA REGLA DEL DUEÑO: «cuando se firma el acuerdo, ¿no se dice ahí mismo cuándo le toca cancelar?
-- Debe ser igual a eso». Lo que se le dice al cliente, lo que queda guardado y lo que se cobra son
-- la MISMA fecha.
--
-- QUÉ HACE (todo o nada: si algo falla, no queda nada a medias):
--   1. Columna `convenios.fecha_primera_cuota`.
--   2. ZALA (`zala.cuota_convenio_del_periodo`) cobra desde esa fecha, igual que Cartera. Se lee la
--      función VIVA y se le cambia una sola línea; si no la encuentra exactamente una vez, ABORTA.
--      Sin fecha guardada, el acuerdo firmado el mismo día de pago empieza el día de pago siguiente
--      (lo que dice la pantalla del acuerdo; antes era `>` y se cobraba ese mismo día — 0 casos hoy).
--   3. Relleno de los 223 acuerdos con la fecha que Cartera YA les cobra (medido: 1.338 cuentas
--      comparadas, lo que debe cada cliente da idéntico).
--   4. Fecha límite de los 72 a su última cuota real. Solo se ALARGA; los 30 que la tienen más
--      tarde no se tocan. Cada fila trae la fecha de antes: si alguien la cambió, no se pisa.
--   5. Los 11 marcados incumplidos antes de tiempo vuelven a 'activo'. Su disparador (mig 130)
--      devuelve sus deudas al acuerdo. Si el 2-nov no están al día, el sistema los vuelve a marcar.
--
-- LO QUE NO CAMBIA: lo que debe cada cliente, pagos, cajas, ahorro, reparto, liquidaciones.
-- ORDEN: correr ESTO antes de subir la app (la ventana del acuerdo ya guarda la columna nueva).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) La columna ────────────────────────────────────────────────────────────────────────────
alter table public.convenios add column if not exists fecha_primera_cuota date;
comment on column public.convenios.fecha_primera_cuota is
  'La primera cuota que se le dijo al cliente al firmar (mig 206). Desde ese día cobran Cartera, la nómina y ZALA. NULL = acuerdo sin fecha guardada (se calcula como antes).';

-- ── 2) ZALA cobra desde la fecha guardada ────────────────────────────────────────────────────
do $$
declare
  v_def text;
  v_n   int;
  v_de  constant text := 'if v_creado is null or v_creado > v_inicio then return 0; end if;';
  v_a   constant text := 'if cv.fecha_primera_cuota is not null then '
                      || 'if v_inicio >= cv.fecha_primera_cuota then return v_cuota; end if; return 0; end if; '
                      || 'if v_creado is null or v_creado >= v_inicio then return 0; end if;';
begin
  v_def := pg_get_functiondef('zala.cuota_convenio_del_periodo(public.convenios, public.contratos, date)'::regprocedure);
  v_n := (length(v_def) - length(replace(v_def, v_de, ''))) / length(v_de);
  if v_n <> 1 then
    raise exception 'zala.cuota_convenio_del_periodo no es la esperada (la línea a cambiar aparece % veces). No se tocó nada.', v_n;
  end if;
  execute replace(v_def, v_de, v_a);
end $$;

-- ── 3) Relleno: la fecha que Cartera ya les cobra ────────────────────────────────────────────
update public.convenios cv
   set fecha_primera_cuota = v.f::date
  from (values
  ('fe5bbccf-2927-4e56-a8ec-a9a864554cd7', '2026-07-20'),
  ('be3af621-f724-403a-b92e-c40c23ced24e', '2026-07-15'),
  ('58048ec1-2722-4721-91ed-ee3e24e6bcd8', '2026-09-09'),
  ('1ce02ff5-5b3f-4989-82dd-50a1aca0831c', '2026-09-28'),
  ('021a4863-4fa5-49e0-a703-e9df3253b9c9', '2026-10-12'),
  ('a14b0213-02b0-4138-bd61-8fa7c6f823f7', '2026-09-02'),
  ('bdabf817-daf3-4e37-b953-fd6bb04e2518', '2026-07-20'),
  ('15564663-b630-47b2-b19d-415e8332b97b', '2026-10-05'),
  ('54aa1233-036e-4be1-a3bf-6aab5e91a3ac', '2026-09-30'),
  ('6e74e6e2-6f51-4948-a485-99d7b25d06ee', '2026-07-15'),
  ('025ad752-c8ac-4d78-ac84-cf3a698b8ab5', '2026-10-12'),
  ('2ce4466e-d623-4a7c-b2f4-bfe936e58ce0', '2026-10-05'),
  ('7e84c063-9788-478e-acd9-c06f59e7c866', '2026-07-27'),
  ('2c225b1d-5beb-48a6-9ce1-e277439d07d5', '2026-07-27'),
  ('b22ce483-2c10-46e4-9333-8888d7eb79c0', '2026-07-22'),
  ('f792903a-8d48-4d87-8f69-cecf24bcae51', '2026-07-20'),
  ('6afcfa37-509d-4934-b49e-cb1677cbd0d3', '2026-07-27'),
  ('fcda6226-2633-440b-962e-bd301f94d410', '2026-07-15'),
  ('04097921-27b9-4553-a19d-51a118c56764', '2026-07-15'),
  ('2d447a27-ec1c-4edf-82db-712c33a7bfe0', '2026-08-10'),
  ('81f85541-58bb-45a0-99d8-9dd51b64a91f', '2026-09-14'),
  ('40befa55-a00d-4677-90c7-b85abb9eeb6c', '2026-08-05'),
  ('466b2f36-14fc-427f-83ca-2b62cc9c0bb4', '2026-09-09'),
  ('3d644823-120f-45eb-bb42-bedce098a528', '2026-07-22'),
  ('9f855eac-0cf9-4a44-ad5f-d9c186d9ad43', '2026-08-17'),
  ('61d1e906-d310-46f5-8d84-181aad5d2f9c', '2026-08-17'),
  ('d2139485-7813-4909-83ae-d3c1342011e4', '2026-07-15'),
  ('52059020-5d7b-48e5-a5ea-a2906630b326', '2026-08-03'),
  ('a4dcb8b1-a43e-4162-8896-ded82e35a1fa', '2026-08-10'),
  ('b70ba367-30dc-46b9-8016-ddab0d010087', '2026-11-02'),
  ('240a6c26-9e04-4c27-b882-9fd6cd40c2b1', '2026-08-03'),
  ('04e65564-a2d6-404b-a067-e0b4f6883a94', '2026-07-15'),
  ('6e91525c-dfce-4728-bc44-7de27d0e401c', '2026-08-10'),
  ('c4029498-66dd-4399-8566-c799ff050627', '2026-08-03'),
  ('d4f5dc1b-14bc-48fc-ab3d-99a5c653a38d', '2026-08-03'),
  ('0e9a8359-324b-40a0-9d26-c076b1f82570', '2026-08-05'),
  ('daf1fad2-4d93-4719-a2e4-f974b8adee70', '2026-08-03'),
  ('f31db7bb-464e-4916-9366-82ee809720f4', '2026-08-10'),
  ('1d3bae37-e2d5-4fee-ba22-e5a5bd8bbf6b', '2026-08-19'),
  ('0634b85a-9151-4f4d-a7cb-705aa435a0ad', '2026-08-17'),
  ('ec0b680d-6f28-45f2-bcdd-462d420a1d5a', '2026-10-26'),
  ('4bc7fd29-df5a-45ab-933a-0bd911c6396a', '2026-09-14'),
  ('e9bedc6e-b40d-41b8-bde3-9b2af15c725c', '2026-08-10'),
  ('61044f56-8e47-46f8-9863-830ac66dde82', '2026-08-17'),
  ('84bfe8f9-5039-4fd3-b5cb-15ba62ddd947', '2026-08-17'),
  ('5445fe6c-f061-4d67-9e9f-dd95b05857af', '2026-08-17'),
  ('5e9e420f-010c-4d41-8bf3-9546de0fceb9', '2026-10-19'),
  ('2cbca424-d939-4c3d-b899-1119c7da3bd8', '2026-09-16'),
  ('70201cd3-8fba-426f-8dcf-759e86b5f52f', '2026-08-03'),
  ('fc22e9a6-f372-45e9-9cb0-da15b027fdcb', '2026-11-02'),
  ('48952448-4a7f-4063-a21f-e5c6327838ab', '2026-08-17'),
  ('83c33049-7aec-4101-9c85-360d7e905015', '2026-09-14'),
  ('f4e458f8-e028-4222-a2c3-67a3719f18c8', '2026-08-10'),
  ('0881ef6d-1a4a-49a3-b386-6e01c2985f24', '2026-08-17'),
  ('3e1f9880-0d43-4a80-a7ef-9be7100a2fcd', '2026-08-17'),
  ('776e57f0-c658-4ea4-9c2f-6f75a7fe4c8e', '2026-08-17'),
  ('aa11167e-604a-4ff9-a5ab-f13fbaa540a9', '2026-08-12'),
  ('42b741ae-6bdc-4440-beb3-0b74430c5853', '2026-11-02'),
  ('f19703da-3c72-4ed4-9829-1c8897ea7d73', '2026-08-17'),
  ('82d1de14-1b28-4496-809d-c173960d83d0', '2026-09-15'),
  ('219f3198-dee4-4226-ba05-8455230d3002', '2026-08-31'),
  ('5fa7ff9f-0a7b-482d-91c1-9e209835b6c7', '2026-08-19'),
  ('5a94cc3b-5ee8-4cf8-bd7b-c87ac86b6b94', '2026-08-24'),
  ('235a2404-06b8-484f-b2c2-eed6e631ac8d', '2026-08-17'),
  ('72785ab9-451d-4e7c-929f-2f83387d7f08', '2026-10-26'),
  ('9bca4f0c-670b-4510-969d-28e474eb029e', '2026-08-17'),
  ('0dfe5dd8-4398-4b6d-a805-d6fc03cf614e', '2026-11-02'),
  ('58db5f46-6ab0-4b5b-9694-7a6f71e346ae', '2026-08-17'),
  ('bba1cd6b-bb55-49d8-851d-9c2d555947dc', '2026-08-24'),
  ('0f8d0b0e-0ba2-4f5f-afff-337a3a9d0e98', '2026-08-17'),
  ('905f1b61-30ec-45c9-9b18-8d8fd8dcd6cc', '2026-08-10'),
  ('572b5389-49ed-43e6-b6ee-b162cc94c5d7', '2026-08-05'),
  ('fef04d7a-820f-40dc-8db4-af58381bba5d', '2026-08-17'),
  ('d83d0e15-9bef-4cf9-a1df-744f0ca39c3a', '2026-08-24'),
  ('76356964-48be-413a-be34-98d2120d3add', '2026-08-10'),
  ('76f5e224-d184-4106-a01d-70a19ffa423a', '2026-08-24'),
  ('1693e1ae-c3e9-4385-bc99-bec529cd22dd', '2026-09-02'),
  ('c47e3533-f66f-410b-a29c-560c4a88dcfe', '2026-09-14'),
  ('160dbcea-8e0d-4cb3-b1d7-bb6041005781', '2026-10-26'),
  ('f19d660b-3298-4360-8754-cefc69af0b0b', '2026-09-28'),
  ('5accba4c-abe7-4c3e-83ed-cfd629232197', '2026-08-31'),
  ('04639404-978e-4b81-8def-b8471a888bdc', '2026-08-31'),
  ('9b2fe442-6fa4-4369-bad9-22872895d020', '2026-09-02'),
  ('7f6c6bb8-9afa-41e2-a7a1-de738a4a4354', '2026-08-31'),
  ('0fdd273a-559d-4079-ad9c-1e5b883797f1', '2026-09-07'),
  ('bab3d20b-9ce3-47b6-bf40-3926c3df7921', '2026-10-19'),
  ('115c575e-37cf-4068-88e4-5b1b3695faf8', '2026-10-19'),
  ('203f4870-418e-4441-b65b-b0bcf4bfff95', '2026-09-07'),
  ('394743d0-3548-4415-9714-af21555bfbd6', '2026-09-07'),
  ('4499118d-3bab-4fd1-8b36-aa9dcf92ad7c', '2026-09-14'),
  ('e4a7d49b-cf62-4af7-99f9-e1c9fe386fa3', '2026-10-05'),
  ('f6255ca4-f4b1-49a6-9b75-54e7a6ca1977', '2026-09-07'),
  ('076fe679-f120-4287-b86b-6db1fe2a152a', '2026-09-09'),
  ('0a3d70b8-b16b-45b6-b402-26b40112506f', '2026-09-14'),
  ('09dde805-49f1-4b44-bbe8-59f99119321a', '2026-09-21'),
  ('a48f0d63-4438-42bb-ac4a-34b24823ce99', '2026-09-07'),
  ('78b52780-ecd1-4250-905f-147eb1dec702', '2026-08-19'),
  ('55e06863-cee9-443b-b13c-19bffb85e65a', '2026-09-07'),
  ('458b786b-99e4-4ade-b18a-fa3a6c5f29a3', '2026-09-07'),
  ('0c169181-16b8-4380-890d-e20cdf9ce48f', '2026-08-24'),
  ('5b3e487d-d4fa-4986-8a5b-d574c57617c6', '2026-09-28'),
  ('1bd63dcc-ce22-4408-884b-84bf84a36c1f', '2026-09-07'),
  ('127e6a69-aacf-466d-96e2-d8a8eaec6ec1', '2026-10-12'),
  ('96d19e6a-acbc-4b95-9db6-a84ba7f82a72', '2026-08-24'),
  ('a079f6eb-1843-48a2-9542-1f628e8a9d82', '2026-09-09'),
  ('81a15cd6-0a0a-4c6b-b44c-a91e9962e938', '2026-10-07'),
  ('d3f62743-e865-4b36-ae9f-37f912a7c68c', '2026-11-02'),
  ('5114bd26-66ee-482a-9186-15883f1a8869', '2026-10-05'),
  ('2e503a19-62cb-4b56-b3f5-503f7a21cd51', '2026-09-07'),
  ('265e50d3-94a4-456c-a257-150f90782336', '2026-10-12'),
  ('3891e069-efd5-4722-b31b-1985ac3c5051', '2026-10-05'),
  ('f1ffab61-d811-4ca7-8a87-a131733afb8c', '2026-10-26'),
  ('c724dac9-f0a8-48a0-92cd-2ebd8813ea44', '2026-09-07'),
  ('5a2ef4b7-93dc-4192-b47d-b38bde068b3f', '2026-10-12'),
  ('2804307b-b9b8-44cd-9a61-0145eaf761f3', '2026-09-02'),
  ('f2224c75-cb15-4f9d-b2a8-22a7d81a8b95', '2026-09-09'),
  ('c99d1fd0-0ac8-4723-9e50-a4223df1f920', '2026-09-07'),
  ('9b30cc73-af7b-4aef-936d-1452aa8a4557', '2026-11-02'),
  ('c7f0d138-f370-492d-9b90-abdc10fad502', '2026-10-19'),
  ('f1810019-3232-478c-995a-b37984f71012', '2026-09-07'),
  ('92b9ad9b-ef9c-4e27-9ab3-e2b9b5bbaa15', '2026-07-20'),
  ('ec796488-acd5-44ea-bf12-6e4cc0b640f8', '2026-07-27'),
  ('5c420292-56f9-4525-9c49-bfe9bdbfb348', '2026-10-05'),
  ('f7d5f9e0-b0c2-4498-ac42-6ffd248f733f', '2026-08-24'),
  ('795d2fdf-d762-4a1e-97b6-c19b10fe4558', '2026-10-19'),
  ('4ff8f7d5-5d16-41cc-b409-c0832d01b63e', '2026-08-24'),
  ('aaa768ae-fac5-44b9-b572-491a6fec0a9c', '2026-08-17'),
  ('34d0bced-3a1a-43b9-96f1-65ac1e03ff0f', '2026-09-07'),
  ('de051f36-fbe4-413b-bb21-6e171b338557', '2026-08-24'),
  ('10ddc247-e9fc-4b46-8332-51b7ddc7a1c7', '2026-09-21'),
  ('46ea0e0b-769c-4c51-843a-429740e871ca', '2026-08-10'),
  ('7a26590c-2cff-488b-9b43-54967afbd4ce', '2026-08-17'),
  ('1d46308e-3de0-4560-9851-f0a82b831d44', '2026-10-05'),
  ('0e380377-c700-4bae-8c86-707a9fd2ff79', '2026-09-21'),
  ('0b7346b2-d310-4ed5-8592-4ea0b6ca6a3b', '2026-09-14'),
  ('47a3ae9f-e24d-4246-a75f-6dce981d5bc3', '2026-08-17'),
  ('fa18f2bf-bf19-4758-90d6-51736a35ac85', '2026-09-14'),
  ('72172da8-0095-4726-9745-13d41128425f', '2026-09-14'),
  ('f3cc85f3-e4f4-4629-8543-b36babdda664', '2026-09-28'),
  ('181939b8-e10f-46f7-b122-f724dda0a63b', '2026-10-05'),
  ('d1a33dc5-255f-46cd-8d21-d916bf9186f6', '2026-09-14'),
  ('16633807-82c2-41ca-a33b-bb4ad5f274f3', '2026-09-14'),
  ('5cd456c7-37c5-43e3-8bc2-45c2a1814e76', '2026-09-21'),
  ('8b676bca-603c-4565-85d0-00fcaa3d5226', '2026-09-14'),
  ('04701eaa-a8ec-4bf4-9cc2-d44b1522f3d5', '2026-08-17'),
  ('0af0d0f0-58f7-4720-a6d8-393302836818', '2026-10-05'),
  ('a99e9f31-e3d0-45fa-9a85-e1612bbd0ab6', '2026-10-05'),
  ('9f68dd37-1757-4968-8a9e-f1d3971c0647', '2026-10-19'),
  ('8737a42e-35df-4a00-8d8e-eb3bd568de77', '2026-09-14'),
  ('844bf3bf-20f3-4b31-8827-949f98b7de8c', '2026-09-21'),
  ('71ba9eb3-077f-4705-ae48-b99c3cf4beeb', '2026-09-21'),
  ('e559f1f1-5ab6-4138-9593-5b876864db20', '2026-09-21'),
  ('f179ada8-9b49-4e59-83cf-d408d7b13144', '2026-08-17'),
  ('20b36145-b0c8-4a53-b322-3eb0636d75c2', '2026-10-05'),
  ('5b299073-3967-4770-a811-eb8792480ecd', '2026-09-21'),
  ('02c2d338-18a7-45bf-bd19-8862fa113412', '2026-09-25'),
  ('99013dcc-f90c-4baa-b4fb-b70f44ae5530', '2026-09-14'),
  ('c8c18d54-1ddf-4a2a-bb71-8bc6ba71d495', '2026-10-19'),
  ('668c43c5-c15f-4b3d-aa21-691f823c3452', '2026-10-19'),
  ('733f8d86-75a3-4361-8607-d4d58410f58e', '2026-10-05'),
  ('c0bec8a1-6aea-4053-9a51-4b2ce823bf0d', '2026-09-02'),
  ('adb64ab1-853e-4bef-88a9-2d09f392823b', '2026-10-05'),
  ('719bafef-3227-40dd-accc-d4cae7c3a4f9', '2026-09-21'),
  ('21fd5f65-4084-4aac-9111-1b359da97f77', '2026-10-05'),
  ('29abb2c9-de14-4e9d-a9a8-947b55cc83f9', '2026-10-26'),
  ('27d9e458-e3d8-45fe-91a0-e0af4658bc20', '2026-10-12'),
  ('c648e1d1-430b-492d-a9a7-e0f2cf7a362b', '2026-09-07'),
  ('df8d0d41-53da-4165-9d10-8a7e966a3ee0', '2026-09-07'),
  ('4e743c84-71f1-42fa-bab3-f953ee5ca710', '2026-10-05'),
  ('159dfffe-b329-40d1-b20d-dc12ec109bfc', '2026-09-07'),
  ('8c6bcdf5-2e23-401d-a7eb-05f8f15a02db', '2026-09-14'),
  ('f574b9d1-1c71-4c57-8394-02603ac4b851', '2026-10-19'),
  ('0d108ddb-df8c-4926-b5ee-85e0b74199be', '2026-10-26'),
  ('8b16af37-1a25-4c3d-9df8-ff7aeaec6f4f', '2026-09-09'),
  ('8f053fa5-60c5-4894-8933-f2846ade7984', '2026-10-05'),
  ('bde8f277-fec3-43a2-945e-f08c7da5dfc0', '2026-10-17'),
  ('be2a2ad5-4186-4d1e-bd6c-49eae2cef355', '2026-10-12'),
  ('74649e19-1832-4c6a-aa46-f659c8062486', '2026-09-28'),
  ('0d941dcc-05ec-4267-bdd6-d1d2731144f9', '2026-09-21'),
  ('6d6b79df-5eeb-4b8c-924a-5ef3db278fdd', '2026-09-16'),
  ('d07511da-d3a4-465f-8052-91b95585d0c1', '2026-10-05'),
  ('bcc95caf-13b1-43db-9c77-298f7b181c81', '2026-09-19'),
  ('309ba04e-94c1-43db-902d-f1bf0a2f6a0d', '2026-10-05'),
  ('fbc5a786-3c1a-46d7-a9d6-0d2ee18c797b', '2026-09-14'),
  ('7c3dd013-4fc8-4c27-94b7-fa0fae8f83b3', '2026-10-12'),
  ('47daf821-a7db-4c19-ad4a-3dc05505ab4b', '2026-10-12'),
  ('c6974ecb-5482-432c-8573-8538f39651e4', '2026-09-14'),
  ('3d057fec-3972-481a-90ea-bcfef47201b4', '2026-10-12'),
  ('c58e4786-78f6-4f32-93d7-8ff5659f241c', '2026-10-19'),
  ('201aa284-9a2f-43c7-a45e-fce107fac431', '2026-09-21'),
  ('0438d31f-1efa-4db7-b244-b137210118f5', '2026-09-14'),
  ('13f8918c-2424-434c-9333-6c0048abf4a7', '2026-10-12'),
  ('fb935793-0943-4073-a179-b63bbe296a68', '2026-10-19'),
  ('3c42b923-25c6-4959-9288-90b5f3525939', '2026-10-19'),
  ('f4667041-9512-4adb-9529-5d3e484d4dd2', '2026-10-19'),
  ('2e090b2f-7a98-4fbb-9f7c-9f66d1fb8edc', '2026-10-26'),
  ('4283f9e5-0cb3-49be-a4f9-8a61a923cc21', '2026-10-19'),
  ('9e71b3bb-10c2-4247-8a7a-94f435033389', '2026-09-28'),
  ('6ef74cb6-a241-44cc-903c-1ac50a6be461', '2026-09-21'),
  ('2276a42d-ca05-4681-a14a-89fa1c07adb4', '2026-09-14'),
  ('ac56fe6b-70fe-49d1-9ba3-944919d2abe4', '2026-10-14'),
  ('be0d88fc-cfc9-471b-8974-8899dc544160', '2026-10-19'),
  ('b6e3e4da-513a-4c71-9edc-6b77e4df86cc', '2026-09-21'),
  ('a84afa9a-b7cd-42d6-927e-097c960de4aa', '2026-08-31'),
  ('7b7eafc7-7292-4d91-96b5-57d8f347a011', '2026-09-14'),
  ('43104670-21a6-4ae1-a9b1-80117c2bc9cf', '2026-09-14'),
  ('94db2b0c-05cc-435d-8a40-a495950fccc9', '2026-08-10'),
  ('e550ffa5-7108-4756-b546-25e96edea7b3', '2026-09-14'),
  ('26a0bac8-2896-43e0-a9ba-a525e3908514', '2026-09-07'),
  ('b9d07e0b-f5ed-4937-bf75-9b5d74961939', '2026-11-02'),
  ('7e041fb3-2ff0-41ab-a94c-b9d6b870bf57', '2026-08-10'),
  ('1c758c47-97d1-402b-9826-26dc1dfcd92c', '2026-10-12'),
  ('0a8917aa-a7f9-4f3e-9a28-8eb921accd7b', '2026-09-21'),
  ('105c6986-2a0f-486c-8f2c-71937da1728e', '2026-09-16'),
  ('b844a529-ba29-4c3c-a901-1616e867f1da', '2026-08-31'),
  ('04e71470-7f08-42c4-8a3e-bf1237a201fa', '2026-09-14'),
  ('9a13af2d-f8fe-43c5-9679-c4a88ce1aa1f', '2026-09-28'),
  ('7b4b22aa-ada9-4ca8-ba5b-ed97fd0ee13b', '2026-09-14'),
  ('c6e0cb15-6036-485b-89b1-b10d95ef2d1f', '2026-11-02'),
  ('7c998095-df42-433e-9592-fe90fbb03ebb', '2026-08-31'),
  ('c56b5815-3bdb-4375-8c5c-d4fcdb4ea660', '2026-11-02'),
  ('73c8b75f-7868-48b1-8b66-3b6fa7cd5a7f', '2026-10-21'),
  ('89230488-41f2-4e4d-b8e0-a0f851e33488', '2026-10-26')
  ) as v(id, f)
 where cv.id = v.id::uuid
   and cv.fecha_primera_cuota is null;

-- ── 4) Fecha límite = la última cuota real (solo se alarga; si cambió desde el 27-oct, no se pisa)
update public.convenios cv
   set fecha_limite = v.nueva::date
  from (values
  ('58048ec1-2722-4721-91ed-ee3e24e6bcd8', '2026-10-28', '2026-11-04'),  -- YAL55H activo
  ('021a4863-4fa5-49e0-a703-e9df3253b9c9', '2026-11-30', '2026-12-07'),  -- RLZ85H activo
  ('15564663-b630-47b2-b19d-415e8332b97b', '2026-12-07', '2026-12-14'),  -- IEW54I activo
  ('025ad752-c8ac-4d78-ac84-cf3a698b8ab5', '2026-11-23', '2026-11-30'),  -- MMC21H activo
  ('2ce4466e-d623-4a7c-b2f4-bfe936e58ce0', '2026-12-07', '2026-12-14'),  -- DQL76I activo
  ('b70ba367-30dc-46b9-8016-ddab0d010087', '2027-01-04', '2027-01-11'),  -- XYZ46H activo
  ('ec0b680d-6f28-45f2-bcdd-462d420a1d5a', '2026-12-28', '2027-01-04'),  -- XZZ84H activo
  ('61044f56-8e47-46f8-9863-830ac66dde82', '2026-09-21', '2026-09-28'),  -- DPW33I incumplido
  ('5e9e420f-010c-4d41-8bf3-9546de0fceb9', '2026-11-23', '2026-11-30'),  -- IEW38I activo
  ('2cbca424-d939-4c3d-b899-1119c7da3bd8', '2026-11-04', '2026-11-11'),  -- RMZ64H activo
  ('fc22e9a6-f372-45e9-9cb0-da15b027fdcb', '2027-01-04', '2027-01-11'),  -- IGC37I activo
  ('42b741ae-6bdc-4440-beb3-0b74430c5853', '2027-01-04', '2027-01-11'),  -- XZP35H activo
  ('72785ab9-451d-4e7c-929f-2f83387d7f08', '2026-12-28', '2027-01-04'),  -- DQL78I activo
  ('0dfe5dd8-4398-4b6d-a805-d6fc03cf614e', '2027-01-04', '2027-01-11'),  -- DPU46I activo
  ('160dbcea-8e0d-4cb3-b1d7-bb6041005781', '2026-12-28', '2027-01-04'),  -- DQF57I activo
  ('bab3d20b-9ce3-47b6-bf40-3926c3df7921', '2026-11-30', '2026-12-07'),  -- XZI14H activo
  ('115c575e-37cf-4068-88e4-5b1b3695faf8', '2026-12-14', '2026-12-21'),  -- DQF56I activo
  ('394743d0-3548-4415-9714-af21555bfbd6', '2026-10-12', '2026-10-19'),  -- DQW27I incumplido
  ('e4a7d49b-cf62-4af7-99f9-e1c9fe386fa3', '2026-11-09', '2026-11-16'),  -- DQW27I activo
  ('09dde805-49f1-4b44-bbe8-59f99119321a', '2027-01-14', '2027-01-18'),  -- ZIB64G activo
  ('a48f0d63-4438-42bb-ac4a-34b24823ce99', '2026-10-26', '2026-11-02'),  -- XYZ54H incumplido
  ('127e6a69-aacf-466d-96e2-d8a8eaec6ec1', '2026-12-14', '2026-12-21'),  -- RLZ97H activo
  ('d3f62743-e865-4b36-ae9f-37f912a7c68c', '2027-01-04', '2027-01-11'),  -- DPW33I activo
  ('5114bd26-66ee-482a-9186-15883f1a8869', '2026-12-07', '2026-12-14'),  -- DPW33I activo
  ('3891e069-efd5-4722-b31b-1985ac3c5051', '2026-11-16', '2026-11-23'),  -- YAT46H activo
  ('f1ffab61-d811-4ca7-8a87-a131733afb8c', '2026-12-28', '2027-01-04'),  -- XZO72H activo
  ('5a2ef4b7-93dc-4192-b47d-b38bde068b3f', '2026-11-16', '2026-11-23'),  -- DPU51I activo
  ('9b30cc73-af7b-4aef-936d-1452aa8a4557', '2027-01-04', '2027-01-11'),  -- IEW48I activo
  ('c7f0d138-f370-492d-9b90-abdc10fad502', '2026-11-23', '2026-11-30'),  -- RML43H activo
  ('5c420292-56f9-4525-9c49-bfe9bdbfb348', '2026-11-16', '2026-11-23'),  -- RLT86H activo
  ('795d2fdf-d762-4a1e-97b6-c19b10fe4558', '2026-11-16', '2026-11-23'),  -- RMY55H activo
  ('4ff8f7d5-5d16-41cc-b409-c0832d01b63e', '2026-10-26', '2026-11-02'),  -- XZP35H incumplido
  ('10ddc247-e9fc-4b46-8332-51b7ddc7a1c7', '2026-10-26', '2026-11-02'),  -- DPW62I incumplido
  ('1d46308e-3de0-4560-9851-f0a82b831d44', '2026-11-16', '2026-11-23'),  -- IGC60I activo
  ('0e380377-c700-4bae-8c86-707a9fd2ff79', '2026-10-26', '2026-11-02'),  -- XYZ50H incumplido
  ('72172da8-0095-4726-9745-13d41128425f', '2026-10-26', '2026-11-02'),  -- DPU45I incumplido
  ('181939b8-e10f-46f7-b122-f724dda0a63b', '2026-11-23', '2026-11-30'),  -- IEW84I activo
  ('0af0d0f0-58f7-4720-a6d8-393302836818', '2026-12-07', '2026-12-14'),  -- IEW47I activo
  ('a99e9f31-e3d0-45fa-9a85-e1612bbd0ab6', '2026-11-05', '2026-11-20'),  -- IGJ77I activo
  ('9f68dd37-1757-4968-8a9e-f1d3971c0647', '2026-11-23', '2026-11-30'),  -- XZZ68H activo
  ('8737a42e-35df-4a00-8d8e-eb3bd568de77', '2026-11-02', '2026-11-09'),  -- DPU59I activo
  ('5b299073-3967-4770-a811-eb8792480ecd', '2026-10-26', '2026-11-02'),  -- IGC36I incumplido
  ('99013dcc-f90c-4baa-b4fb-b70f44ae5530', '2026-10-26', '2026-11-02'),  -- RNK57H incumplido
  ('c8c18d54-1ddf-4a2a-bb71-8bc6ba71d495', '2026-12-21', '2026-12-28'),  -- YAL65H activo
  ('668c43c5-c15f-4b3d-aa21-691f823c3452', '2026-12-21', '2026-12-28'),  -- XZI11H activo
  ('719bafef-3227-40dd-accc-d4cae7c3a4f9', '2026-10-26', '2026-11-02'),  -- RML40H incumplido
  ('29abb2c9-de14-4e9d-a9a8-947b55cc83f9', '2026-12-14', '2026-12-21'),  -- IGJ81I activo
  ('27d9e458-e3d8-45fe-91a0-e0af4658bc20', '2026-11-16', '2026-11-23'),  -- IEW61I activo
  ('df8d0d41-53da-4165-9d10-8a7e966a3ee0', '2026-10-26', '2026-11-02'),  -- XZN83H incumplido
  ('f574b9d1-1c71-4c57-8394-02603ac4b851', '2026-11-30', '2026-12-07'),  -- XZI09H activo
  ('0d108ddb-df8c-4926-b5ee-85e0b74199be', '2026-12-21', '2026-12-28'),  -- DQW27I activo
  ('8f053fa5-60c5-4894-8933-f2846ade7984', '2026-11-23', '2026-11-30'),  -- DQG97I activo
  ('bde8f277-fec3-43a2-945e-f08c7da5dfc0', '2026-11-02', '2026-11-17'),  -- NGY24I activo
  ('be2a2ad5-4186-4d1e-bd6c-49eae2cef355', '2026-12-14', '2026-12-21'),  -- RLZ89H activo
  ('74649e19-1832-4c6a-aa46-f659c8062486', '2026-11-30', '2026-12-07'),  -- RMZ62H activo
  ('d07511da-d3a4-465f-8052-91b95585d0c1', '2026-12-07', '2026-12-14'),  -- RMM71H activo
  ('309ba04e-94c1-43db-902d-f1bf0a2f6a0d', '2026-11-16', '2026-11-23'),  -- RML58H activo
  ('7c3dd013-4fc8-4c27-94b7-fa0fae8f83b3', '2026-12-14', '2026-12-21'),  -- DQG94I activo
  ('47daf821-a7db-4c19-ad4a-3dc05505ab4b', '2026-11-30', '2026-12-07'),  -- XZO09H activo
  ('c58e4786-78f6-4f32-93d7-8ff5659f241c', '2026-12-14', '2026-12-21'),  -- MLQ75H activo
  ('201aa284-9a2f-43c7-a45e-fce107fac431', '2026-10-26', '2026-11-02'),  -- DQL71I incumplido
  ('0438d31f-1efa-4db7-b244-b137210118f5', '2026-10-26', '2026-11-02'),  -- IGC38I incumplido
  ('fb935793-0943-4073-a179-b63bbe296a68', '2026-12-21', '2026-12-28'),  -- DPU49I activo
  ('f4667041-9512-4adb-9529-5d3e484d4dd2', '2026-12-14', '2026-12-21'),  -- XZN28H activo
  ('2e090b2f-7a98-4fbb-9f7c-9f66d1fb8edc', '2026-12-07', '2026-12-14'),  -- IGC57I activo
  ('9e71b3bb-10c2-4247-8a7a-94f435033389', '2026-11-09', '2026-11-16'),  -- DQF58I activo
  ('43104670-21a6-4ae1-a9b1-80117c2bc9cf', '2026-10-19', '2026-10-26'),  -- IEW65I incumplido
  ('e550ffa5-7108-4756-b546-25e96edea7b3', '2026-10-19', '2026-10-26'),  -- DPU47I incumplido
  ('b9d07e0b-f5ed-4937-bf75-9b5d74961939', '2027-01-04', '2027-01-11'),  -- YAL66H activo
  ('9a13af2d-f8fe-43c5-9679-c4a88ce1aa1f', '2026-11-30', '2026-12-07'),  -- IEW51I activo
  ('c6e0cb15-6036-485b-89b1-b10d95ef2d1f', '2027-01-04', '2027-01-11'),  -- RMZ62H activo
  ('c56b5815-3bdb-4375-8c5c-d4fcdb4ea660', '2027-01-04', '2027-01-11')   -- XZI06H activo
  ) as v(id, antes, nueva)
 where cv.id = v.id::uuid
   and cv.fecha_limite = v.antes::date;

-- ── 5) Los 11 marcados incumplidos antes de su última cuota (2-nov) vuelven a 'activo' ──────
update public.convenios
   set estado = 'activo'
 where estado = 'incumplido'
   and id in (
  'a48f0d63-4438-42bb-ac4a-34b24823ce99',  -- XYZ54H
  '4ff8f7d5-5d16-41cc-b409-c0832d01b63e',  -- XZP35H
  '10ddc247-e9fc-4b46-8332-51b7ddc7a1c7',  -- DPW62I
  '0e380377-c700-4bae-8c86-707a9fd2ff79',  -- XYZ50H
  '72172da8-0095-4726-9745-13d41128425f',  -- DPU45I
  '5b299073-3967-4770-a811-eb8792480ecd',  -- IGC36I
  '99013dcc-f90c-4baa-b4fb-b70f44ae5530',  -- RNK57H
  '719bafef-3227-40dd-accc-d4cae7c3a4f9',  -- RML40H
  'df8d0d41-53da-4165-9d10-8a7e966a3ee0',  -- XZN83H
  '201aa284-9a2f-43c7-a45e-fce107fac431',  -- DQL71I
  '0438d31f-1efa-4db7-b244-b137210118f5'   -- IGC38I
   );

commit;

-- ── Verificación (correr después; debe dar: 223 · 0 · 2 · 11) ─────────────────────────────
select
  (select count(*) from public.convenios where fecha_primera_cuota is not null)                       as con_primera_cuota,
  (select count(*) from public.convenios where fecha_primera_cuota is null and cuota_por_periodo > 0) as sin_primera_cuota,
  (select count(*) from public.convenios where id in (select v.id::uuid from (values
     ('58048ec1-2722-4721-91ed-ee3e24e6bcd8'),('2ce4466e-d623-4a7c-b2f4-bfe936e58ce0')) v(id))
     and fecha_limite in ('2026-11-04','2026-12-14'))                                                  as muestra_limites_2_de_2,
  (select count(*) from public.convenios where estado = 'activo' and id in (
     'a48f0d63-4438-42bb-ac4a-34b24823ce99','4ff8f7d5-5d16-41cc-b409-c0832d01b63e','10ddc247-e9fc-4b46-8332-51b7ddc7a1c7',
     '0e380377-c700-4bae-8c86-707a9fd2ff79','72172da8-0095-4726-9745-13d41128425f','5b299073-3967-4770-a811-eb8792480ecd',
     '99013dcc-f90c-4baa-b4fb-b70f44ae5530','719bafef-3227-40dd-accc-d4cae7c3a4f9','df8d0d41-53da-4165-9d10-8a7e966a3ee0',
     '201aa284-9a2f-43c7-a45e-fce107fac431','0438d31f-1efa-4db7-b244-b137210118f5'))                   as los_11_activos;
