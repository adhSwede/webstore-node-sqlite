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

#### \*\*One-to-many (`1-<`)

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

### Felhantering vid datavalidering (`handleDBError.ts`)

##### Implementering:

```ts
export const handleDBError = (
  condition: boolean,
  message: string,
  status: number
) => {
  if (condition) throw Object.assign(new Error(message), { status });
};
```

Exempel på användning:

```ts
const id = parseInt(req.params.id, 10);
handleDBError(isNaN(id), "Invalid ID", 400);
```

### Felhantering i asynkrona anrop (`asyncHandler.ts`)

##### Implementering:

```ts
const asyncHandler =
  <Req extends Request = Request, Res extends Response = Response>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<any>
  ) =>
  (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
```

- Exempel på användning:

```ts
const getProductById: RequestHandler = asyncHandler(async (req, res, next) => {
  const product = db
    .prepare(`SELECT * FROM Products WHERE Product_ID = ?`)
    .get(req.params.id);
  handleDBError(!product, "Product not found", 404);
  res.json(product);
});
```

### Exempel på validering i en endpoint

##### Implementering med validering:

```ts
const postProduct = asyncHandler(async (req, res, next) => {
  const { name, price, stock } = req.body;

  handleDBError(!name, "Name is required", 400);
  handleDBError(
    price === undefined || isNaN(price) || price <= 0,
    "Invalid price",
    400
  );
  handleDBError(
    stock === undefined || isNaN(stock) || stock < 0,
    "Invalid stock",
    400
  );

  db.prepare(`INSERT INTO Products (Name, Price, Stock) VALUES (?, ?, ?);`).run(
    name,
    price,
    stock
  );
  res.status(201).json({ message: "Product created" });
});
```

- Om `name` saknas, skickas `"Name is required"` (HTTP 400).
- Om `price` är negativt eller ogiltigt, skickas `"Invalid price"` (HTTP 400).
- Om `stock` är mindre än `0`, skickas `"Invalid stock"` (HTTP 400).
