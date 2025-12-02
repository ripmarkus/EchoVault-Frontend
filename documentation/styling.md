Her er din **EchoVault Frontend - Styling Guide** oversat til dansk:

---

# EchoVault Frontend - Styling Guide

## Brug af skabelonen

### Grundlæggende opsætning

1. **Kopiér `template.html`** for at oprette nye sider
2. **Opdater titel** og meta-information
3. **Rediger hovedindholdet** efter behov
4. **Importer nødvendige JavaScript-moduler** (Navbar og sidebar skal altid loades, udover på login siden)
    ```html
    <script type="module">
        import { loadNavbar } from '../js/navigation/navbar.js';
        import {loadSidebar} from "../js/navigation/sidebar.js";
        loadNavbar('navbar-container');
        loadSidebar('sidebar-container')
    </script>
   ```

### Skabelonfunktioner

* **Responsivt layout**: Flexbox-baseret layout med sidebar og hovedindhold
* **Mørkt tema**: Forudkonfigureret mørk tilstand
* **Komponentindlæsning**: Automatisk indlæsning af navbar og sidebar
* **Tailwind CSS**: Utility-first CSS-ramme inkluderet

### Oprettelse af en ny side

1. **Kopiér skabelonen**:

2. **Opdater sidens titel**:

   ```html
   <title>EchoVault - Din Side</title>
   ```

3. **Erstat hovedindholdet**:

   ```html
   <main class="flex-1 pt-8 pb-12">
       <!-- Dit sideindhold her -->
   </main>
   ```


### Komponentintegration

Skabelonen indlæser automatisk:

* **Navbar**: Topnavigation
* **Sidebar**: Sidnavigation

For at tilføje nye komponenter:

1. Opret komponenten i den relevante `js/`-mappe
2. Eksporter de nødvendige funktioner
3. Importer og initialiser i dit sidescript

---

## Designsystem

Vi bruger ikke en css fil, men i stedet bruger vi tailwind classes direkte i tagsene. Derfor skal der IKKE laves en
css fil.

### Farveskema

Applikationen bruger et mørkt tema med følgende farvepalette:

* **Primær baggrund**: `bg-gray-900` – Hovedbaggrund
* **Sekundær baggrund**: `bg-gray-800` – Kort, modaler, forhøjede overflader
* **Tekstfarver**:

    * Primær: `text-white` – Hovedtekst
    * Sekundær: `text-gray-400` – Beskrivelser, undertekster
* **Accentfarver**:

    * Primær knap: `bg-[#55A5F8]` med `hover:bg-[#3F8CE0]`
    * Sekundær knap: `bg-gray-700` med `hover:bg-gray-600`

---

### Layoutsystem

#### Hovedlayoutstruktur

```html
<body class="h-full bg-gray-900 text-white">
  <div id="navbar-container"></div>
  <div class="flex max-h-screen bg-gray-900">
    <div id="sidebar-container" class="flex-shrink-0"></div>
    <main class="flex-1 pt-8 pb-12">
      <!-- Sideindhold -->
    </main>
  </div>
</body>
```

#### Indholdsbokse

* **Max bredde**: Brug `max-w-7xl mx-auto` til indholdsbokse
* **Hovedpadding**: `pt-8 pb-12` for ensartet vertikal afstand
* **Ingen horisontal padding**: Indhold flugter med sidebar på desktop/laptop

---

### Typografi

#### Overskrifter

```html
<!-- Sidetitel -->
<h1 class="text-4xl md:text-6xl font-bold text-white mb-6">

<!-- Sektion Overskrift -->
<h2 class="text-3xl font-bold text-center text-white mb-12">

<!-- Korttitel -->
<h3 class="text-xl font-semibold text-white">
```

#### Brødtekst

```html
<!-- Primær tekst -->
<p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">

<!-- Beskrivelsestekst -->
<p class="text-gray-400">
```

---

### Komponentstil

#### Knapper

**Primær knap:**

```html
<button class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200">
```

**Sekundær knap:**

```html
<button class="px-6 py-3 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all duration-200">
```

#### Kort

```html
<div class="bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-300">
  <!-- Kortindhold -->
</div>
```

#### Grid-layouts

```html
<!-- To-kolonne grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
  <!-- Grid-elementer -->
</div>
```

---

### Responsive retningslinjer

#### Målrettede enheder

* **Breakpoints**: Brug `md:` og `lg:` til responsiv adfærd

#### Layoutadfærd

```html
<!-- Responsiv knapcontainer -->
<div class="flex flex-col sm:flex-row gap-4 justify-center">

<!-- Responsiv tekststørrelse -->
<h1 class="text-4xl md:text-6xl font-bold">
```

---

### Interaktive tilstande

#### Hover-effekter

```css
/* Knap hover */
hover:bg-[#3F8CE0]
hover:bg-gray-600

/* Kort hover (valgfrit) */
transition-colors duration-300
```

#### Fokus-tilstande

```css
/* Knap fokus */
focus:outline-none 
focus:ring-2 
focus:ring-[#55A5F8] 
focus:ring-offset-gray-900
```

---

### Afstandssystem

#### Margener

* **Sektion-afstand**: `mb-16` mellem større sektioner
* **Indholdsafstand**: `mb-6`, `mb-8`, `mb-12` for indholdshierarki
* **Lille afstand**: `mb-4` til relaterede elementer

#### Padding

* **Kort-padding**: `p-8`
* **Knap-padding**: `px-6 py-3`
* **Hovedindhold**: `pt-8 pb-12`

---

### Skygger og effekter

#### Skygger

```css
/* Kort-skygge */
shadow-lg

/* Valgfri brugerdefineret skygge */
shadow-xl
```

#### Overgange

```css
/* Standard transition */
transition-all duration-200

/* Farveovergange */
transition-colors duration-300
```

---

### Bedste praksis

1. **Konsistens**: Brug altid etableret farvepalette
2. **Tilgængelighed**: Bevar korrekt kontrast
3. **Performance**: Brug Tailwinds utility-klasser for optimal CSS
4. **Mørkt tema**: Sørg for alle komponenter fungerer i mørk tilstand
5. **Spacing**: Følg etableret spacing-system for visuel harmoni

---

### Hurtig reference

```html
<!-- Standard sidecontainer -->
<section class="max-w-7xl mx-auto text-center mb-16">

<!-- Standard kort -->
<div class="bg-gray-800 rounded-lg shadow-lg p-8">

<!-- Standard knapgruppe -->
<div class="flex flex-col sm:flex-row gap-4 justify-center">
  <button class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200">
    Primær handling
  </button>
</div>
```
