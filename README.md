# PlanYourFit

Pełnoprawna aplikacja do planowania aktywności fizycznej. Łączy kalendarz treningów z pogodą, wyszukiwaniem obiektów sportowych, generowaniem tras biegowych i rekomendacjami bezpieczeństwa.

## Najważniejsze możliwości

- rejestracja, logowanie i sesja JWT w bezpiecznym ciasteczku,
- prywatne dane każdego użytkownika i kontrola własności rekordów,
- kalendarz w widoku miesiąca, tygodnia oraz dnia,
- dodawanie, edycja, usuwanie i cotygodniowe powtarzanie aktywności,
- obsługa biegania, koszykówki na hali i zewnątrz oraz pływania,
- prognoza Open-Meteo pobierana wyłącznie przez backend,
- wyszukiwanie hal i basenów z cache w MySQL,
- generowanie pętli biegowych i zapisywanie GeoJSON,
- moduł rekomendacji z oceną `good`, `warning`, `bad` i `unknown`,
- filtrowanie, wyszukiwanie, podsumowania tygodnia i miesiąca,
- responsywny interfejs oraz tryb jasny i ciemny,
- tryb demonstracyjny dostępny bez konfiguracji bazy.

## Technologie

- frontend: React 19, JavaScript, czysty CSS,
- backend: Node.js, Express 5, Zod, JWT, bcrypt, Helmet i rate limiting,
- baza: MySQL 8,
- integracje: Open-Meteo, opcjonalnie Google Places i OpenRouteService.

## Struktura

```text
client/      aplikacja React, strony, komponenty i obsługa API
server/      Express, kontrolery, trasy, middleware, usługi i testy
database/    schema.sql i seed.sql
```

## Uruchomienie lokalne

Wymagane są Node.js 20+ i MySQL 8+.

1. Zainstaluj zależności z katalogu głównego:

   ```bash
   npm install
   ```

2. Utwórz bazę i tabele:

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p planyourfit < database/seed.sql
   ```

3. Skopiuj `.env.example` do `.env` i ustaw dane połączenia z MySQL. Koniecznie zmień `JWT_SECRET` na długi, losowy sekret.

4. Uruchom frontend i backend jednocześnie:

   ```bash
   npm run dev
   ```

5. Otwórz `http://localhost:3000`. API działa pod `http://localhost:4000/api`.

Konto z danych startowych: `demo@planyourfit.pl`, hasło: `Demo1234!`.

## Integracje

Open-Meteo nie wymaga klucza. Bez kluczy Google Places i OpenRouteService backend zwraca bezpieczne dane demonstracyjne, więc cały przepływ interfejsu pozostaje testowalny.

Aby włączyć prawdziwe usługi, ustaw w `.env`:

```env
GOOGLE_PLACES_API_KEY=...
OPENROUTESERVICE_API_KEY=...
```

Klucze nigdy nie trafiają do frontendu. Zapytania przechodzą przez REST API, a pogoda i miejsca są cache'owane w MySQL.

## REST API

| Obszar | Endpointy |
| --- | --- |
| Autoryzacja | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Aktywności | `GET/POST /api/activities`, `GET/PUT/DELETE /api/activities/:id` |
| Pogoda | `GET /api/weather` |
| Miejsca | `GET /api/places` |
| Trasy | `POST /api/routes/running` |
| Rekomendacje | `POST /api/recommendations/evaluate` |
| Statystyki | `GET /api/stats/week`, `GET /api/stats/month` |
| Konto | `PUT /api/users/me`, `PUT /api/users/me/password` |

## Testy i build

```bash
npm test
npm run build
```

Testy jednostkowe obejmują najważniejsze warianty modułu rekomendacji: brak danych, burzę, upał i dobre warunki.

## Produkcja

Przed wdrożeniem ustaw `NODE_ENV=production`, silny `JWT_SECRET`, właściwy `CLIENT_URL` oraz połączenie TLS/reverse proxy. Produkcyjny backend odmawia startu z domyślnym sekretem deweloperskim.
