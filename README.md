# FAnn CRM

Interní CRM v Nuxtu pro práci s referenčními profily zákazníků, prodejními otázkami, námitkami a produktovými doporučeními v parfumerii. Data poskytuje REST API `../../php/php-core`.

## Spuštění

```bash
cp .env.example .env
npm ci
npm run dev
```

PHP API musí běžet na adrese z `PHP_API_BASE_URL`. Protože je `php-core` multi-tenantní, host z `FRONTEND_HOST` musí být v jeho `FRANCHISE_CODES` namapovaný na tenant `fun` a databáze musí obsahovat role a administrátora pro tento tenant.

Referenční profily a produktový katalog nahraje idempotentní migrace:

```bash
mysql -u admin -p php_core < ../../php/php-core/migrations/20260912_fun_seed.sql
mysql -u admin -p php_core < ../../php/php-core/migrations/20260913_fun_product_categories.sql
```

Normalizovaný profilový model a finální názvy vazeb připravují migrace
`20260912_customer_profiles.sql` a
`20260912_rename_customer_profile_relations.sql`. Přesný diagram, všechny
sloupce a klíče jsou v
[`src/Modules/CustomerProfile/README.md`](https://github.com/suku-kahanamoku/php-core/blob/main/src/Modules/CustomerProfile/README.md).

`INTERNAL_API_KEY` musí mít v Nuxtu stejnou serverovou hodnotu jako v `php-core`.
Klíč nikdy nevystavujte v `runtimeConfig.public`, klientském JavaScriptu ani v Git repozitáři.

## Přístup k API

Prohlížeč komunikuje s Nuxt endpointy pod `/api`. Nuxt server následně volá
`php-core`, přidává tenant host z `FRONTEND_HOST` a u všech GET požadavků také
`X-Internal-Key`. Díky tomu mohou read-only stránky FAnn CRM načítat také uživatele,
role a adresy bez uživatelské session.

- GET `/api/admin/**` nevyžaduje Nuxt session; PHP ale stále uplatní pravidla konkrétního modulu.
- POST, PATCH, PUT a DELETE pod `/api/admin/**` vyžadují přihlášeného administrátora a Bearer token.
- Interní klíč v PHP povoluje čtení uživatelů, rolí a adres. Nezpřístupňuje objednávky, faktury, soubory ani náhled šablon.
- Veřejné katalogové GETy (`products`, `categories`, `texts`, `enumerations`) vracejí pouze veřejná/publikovaná data.
- Bez platného tenant hostu vrátí PHP `403`, i když je interní klíč správný.

## Proměnné prostředí

```dotenv
PHP_API_BASE_URL=https://api.example.com/api
FRONTEND_HOST=https://crm.example.com
INTERNAL_API_KEY=<stejný-serverový-klíč-jako-v-php-core>
NUXT_SESSION_PASSWORD=<náhodná-hodnota-alespoň-32-znaků>
```

Na Netlify nastavte tyto hodnoty jako neveřejné environment variables. Po změně
proměnných je potřeba nový deploy, protože je serverová aplikace načítá při startu.

## Datový model

- Klienti používají modul `users`.
- Profily zákazníků používají samostatný modul `customer-profiles`.
- Otázky, námitky a preference jsou relační data profilu; uživatelé je dostávají přes M:N vazbu `user_customer_profile` s pořadím, kde `1` je první.
- Produkty používají modul `products`; jejich FAnn klasifikace je M:N vazba `product_category` a frontend ji zapisuje přes `category_ids`.
- Kategorie jako Parfémy, Krémy a péče, Líčidla a Ostatní jsou běžné záznamy v `category`, takže je lze dále rozšiřovat bez změny kódu.
- Cenové rozpětí, charakter, prodejní argument a upsell jsou uložené v `product.data`; jediným údajem vhodnosti produktu pro profil je `probability_percent` v `product_customer_profile_probability`.
- Alternativy jsou směrové a seřazené vazby mezi existujícími produkty v `product_alternative`; každá položka API `alternatives` obsahuje `alternative_product_id` a `position` a odpovídá jednomu řádku tabulky.
- Frontend nadále používá stabilní API pole `profiles` a `profile_probabilities`; názvy databázových tabulek se do klienta neposílají.
- Pravděpodobné produkty se zobrazují v kontextu profilu a zákazníka, od hranice 30 %, seřazené od nejvyšší pravděpodobnosti.
- Obrázky produktů používají dvoufázový upload modul `files`.

## Produkční kontrola

Po nasazení ověřte alespoň:

1. anonymní GET seznamů profilů, produktů, kategorií, klientů, rolí a adres přes FAnn CRM;
2. přihlášení administrátora a vytvoření, úpravu i smazání testovacího záznamu;
3. že přímé volání PHP bez známého tenant hostu vrací `403`;
4. že zápis bez Bearer tokenu vrací `401`;
5. že `INTERNAL_API_KEY` není přítomný v odpovědích ani v klientském bundle.
