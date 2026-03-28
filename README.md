# n8n-nodes-emailmd

n8n community node do wysyłania emaili renderowanych z Markdown za pomocą [emailmd](https://github.com/unmta/emailmd).

## Funkcje

- Pisz treść emaila w Markdown zamiast HTML
- Obsługa YAML frontmatter (`preheader`, `theme`)
- Wbudowane motywy: `default`, `light`, `dark`
- Nadpisywanie kolorów i typografii motywu
- Wsparcie dla: To, CC, BCC, Reply-To, attachments
- Automatyczna generacja wersji plain-text
- Dyrektywy emailmd: `{button}`, `:::callout`, `:::hero`, `:::footer`

## Instalacja

### Opcja 1 — npm link (lokalny development)

```bash
# 1. Zbuduj node
cd /path/to/n8n-nodes-emailmd
npm install
npm run build

# 2. Zlinkuj lokalnie
npm link

# 3. W katalogu n8n
cd ~/.n8n
mkdir -p custom
cd custom
npm link n8n-nodes-emailmd
```

### Opcja 2 — Ścieżka do custom nodes w n8n

Ustaw zmienną środowiskową przed uruchomieniem n8n:

```bash
export N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-emailmd"
n8n start
```

### Opcja 3 — npm install (po opublikowaniu)

```bash
npm install n8n-nodes-emailmd
```

## Konfiguracja

### Credentials (SMTP)

Dodaj credentials typu **SMTP**:
- **Host** — serwer SMTP (np. `smtp.gmail.com`)
- **Port** — `465` (SSL) lub `587` (STARTTLS)
- **Secure** — `true` dla portu 465
- **User** / **Password**

### Parametry node

| Pole | Opis |
|---|---|
| From Name | Nazwa nadawcy |
| From Email | Adres nadawcy (wymagany) |
| To | Odbiorcy (przecinkami) |
| Subject | Temat (wymagany) |
| Markdown | Treść w Markdown (wymagany) |
| Theme | Motyw: default / light / dark |
| Theme Overrides | Nadpisanie kolorów i fontów |
| Attachments | Nazwy binary properties |

## Przykładowy Markdown

```markdown
---
preheader: Krótki podgląd w skrzynce odbiorczej
---

# Witaj {{$json.name}}!

Dziękujemy za rejestrację. Twoje konto jest gotowe.

:::callout
Twój kod aktywacyjny: **{{$json.code}}**
:::

[Aktywuj konto](https://example.com/activate){button}

---

Jeśli masz pytania, odpowiedz na tego emaila.
```

## Obsługiwana składnia emailmd

- **Przyciski**: `[tekst](url){button}` lub `{button .success}`, `{button .danger}`
- **Callout**: `:::callout ... :::`
- **Hero**: `:::hero ... :::`
- **Header/Footer**: `:::header ... :::`, `:::footer ... :::`
- **Wyrównanie**: `:::centered ... :::`
- **Tabele**, listy, kod, obrazy — standardowy Markdown
