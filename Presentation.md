# **Presentation**: Inlämningsarbete Databaser

_2025-02-24_

## Innehåll

- [Databaser och SQL](#databaser-och-sql)
  - [Huvudentiteter](#huvudentiteter)
  - [Relationer](#relationer)
    - [One-to-many (`1-<`)](#one-to-many-1)
    - [One-to-one (`1-1`)](#one-to-one-1-1)
    - [Many-to-many (`>-<`)](#many-to-many)
- [Felhantering](#felhantering)
  - [Centraliserad felhantering (`errorHandler.ts`)](#centraliserad-felhantering-errorhandlerts)
  - [Felhantering vid datavalidering (`handleDBError.ts`)](#felhantering-vid-datavalidering-handledberrorts)
  - [Felhantering i asynkrona anrop (`asyncHandler.ts`)](#felhantering-i-asynkrona-anrop-asynchandlerts)
  - [Exempel på validering i en endpoint](#exempel-pa-validering-i-en-endpoint)
- [Extra VG-funktionalitet](#extra-vg-funktionalitet)

## Databaser och SQL

### Huvudentiteter

Våra huvudentiteter i databasen:

- `Products` - (_Produkter_)
- `Customers` - (_Kunder_)
- `Orders` - (_Ordrar_)
- `Categories` - (_Kategorier_)
- `Manufacturers` - (_Tillverkare_)

Dessa entiteter är sammanlänkade genom `FOREIGN KEYS`.

### Relationer

- **One-to-many (`1-<`)**: Kunder och ordrar.
- **One-to-one (`1-1`)**: Kunder och adresser.
- **Many-to-many (`>-<`)**: Produkter och kategorier.

#### **One-to-many (`1-<`)**

**Exempel:** En kund kan ha flera ordrar, men en order tillhör endast en kund.

- **Varje kund (`Customer_ID`)** kan ha **flera** ordrar (`Order_ID`).
- **Varje order (`Order_ID`)** tillhör exakt **en** kund.

##### Implementering:

```sql
CREATE TABLE Orders (
  Order_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Customer_ID INTEGER,
  FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
);
```

`ON DELETE CASCADE` - Om en kund tas bort, raderas även alla kopplade ordrar.

#### **One-to-one (`1-1`)**

En kund har exakt **en** adress, och **en** adress tillhör **endast en** kund.

- Varje kund (Customer_ID) har en unik adress (Address_ID).
- Varje adress (Address_ID) kan endast tillhöra en kund.

##### Implementering:

```sql
CREATE TABLE Addresses (
Address_ID INTEGER PRIMARY KEY AUTOINCREMENT,
Customer_ID INTEGER UNIQUE,
FOREIGN KEY (Customer_ID) REFERENCES Customers(Customer_ID) ON DELETE CASCADE
);
```

- `UNIQUE` - ingen kund kan ha fler än en adress.
- `ON DELETE CASCADE`- Om en kund tas bort, tas även kundens adress bort.

#### **Many-to-many (`>-<`)**

Produkter kan tillhöra flera kategorier, och kategorier kan innehålla flera produkter.

- En produkt (`Product_ID`) kan tillhöra flera kategorier.
- En kategori (`Category_ID`) kan innehålla flera produkter.

##### Implementering:

```sql
CREATE TABLE ProductCategories (
Product_ID INTEGER,
Category_ID INTEGER,
PRIMARY KEY (Product_ID, Category_ID),
FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
FOREIGN KEY (Category_ID) REFERENCES Categories(Category_ID) ON UPDATE CASCADE
);
```

- Kopplingstabellen hanterar kopplingen mellan produkter och kategorier.
- `ON DELETE CASCADE` - Om en produkt tas bort, raderas även dess koppling till kategorier.

## Felhantering

### Centraliserad felhantering (`errorHandler.ts`)

- **Varför?**
  - Istället för att ha try-catch överallt, fångar man alla fel i en central felhanterare.

##### Implementering:

```ts
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.stack || err);

  const statusCode =
    err.status && Number.isInteger(err.status) ? err.status : 500;

  res.status(statusCode).json({
    error:
      statusCode === 500
        ? "Internal Server Error"
        : err.message || "An error occurred",
  });
};

export default errorHandler;
```

## Extra VG-funktionalitet

### Avancerad filtrering för produkter

- **Vad gör det?**
  - "Användaren kan söka efter produkter baserat på prisintervall, namn eller kategori."

##### Implementering:

```sql
SELECT * FROM Products WHERE Price BETWEEN ? AND ?;
```

- **Exempelanrop i Postman:**

  - `GET /products?minPrice=100&maxPrice=500`
  - "Detta hämtar alla produkter som kostar mellan 100 och 500."

- **Varför är detta användbart?**
  - "Ger användaren flexibilitet att filtrera produkter baserat på sina behov."

## Sammanfattning & Frågor

- "Sammanfattningsvis har jag byggt ett API med SQLite och Express."
- "Jag har implementerat relationer, validering och extra funktionalitet."
- **Frågor?**
