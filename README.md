# vendoro-back

## Testowanie

### Uruchamianie testów

Projekt używa Jest do testowania. Dostępne są następujące komendy:

#### Wszystkie testy z raportem HTML
```bash
npm test
```
Po uruchomieniu testów automatycznie zostanie wygenerowany plik `test-report.html` z wynikami testów, który możesz otworzyć w przeglądarce.

#### Testy z pokryciem kodu
```bash
npm run test:coverage
```
Wyświetla szczegółowe informacje o pokryciu kodu testami. Raport pokrycia zostanie wygenerowany w folderze `coverage/` - możesz otworzyć `coverage/lcov-report/index.html` w przeglądarce, aby zobaczyć szczegółowy raport.

#### Inne komendy
- `npm run test:watch` - uruchamia testy w trybie watch (automatyczne uruchamianie przy zmianach)
- `npm run test:html` - uruchamia testy i próbuje automatycznie otworzyć raport HTML w przeglądarce

### Struktura testów
Wszystkie testy znajdują się w folderze `tests/` i obejmują:
- `auth.test.js` - testy autoryzacji
- `users.test.js` - testy użytkowników
- `products.test.js` - testy produktów
- `categories.test.js` - testy kategorii
- `addresses.test.js` - testy adresów
- `orders.test.js` - testy zamówień
- `ratings.test.js` - testy ocen
- `reports.test.js` - testy raportów
