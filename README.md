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

### Docker z lokalnym volume (zalecane)

Typowa konfiguracja n8n w Dockerze ma volume zamontowany w kontenerze pod `/home/node/.n8n`.
Na hoście odpowiada mu katalog, który przekazujesz przez `-v` lub w `docker-compose.yml`.

#### Krok 1 — sklonuj i zbuduj plugin na hoście

```bash
git clone ssh://gitea@git.cynarski.pl:65522/n8n/emailmd.git n8n-nodes-emailmd
cd n8n-nodes-emailmd
npm install
npm run build
```

#### Krok 2 — skopiuj zbudowany plugin do volume n8n

Zakładając, że volume hosta jest np. w `~/n8n-data`:

```bash
mkdir -p ~/n8n-data/custom/node_modules/n8n-nodes-emailmd
cp -r dist package.json node_modules ~/n8n-data/custom/node_modules/n8n-nodes-emailmd/
```

> Katalog `custom` wewnątrz volume jest automatycznie skanowany przez n8n jako lokalne node_modules.

#### Krok 3 — docker-compose.yml

Dodaj zmienną środowiskową `N8N_CUSTOM_EXTENSIONS` wskazującą na katalog `custom` wewnątrz kontenera:

```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - ~/n8n-data:/home/node/.n8n
    restart: unless-stopped
```

Następnie zrestartuj kontener:

```bash
docker compose down && docker compose up -d
```

#### Alternatywa — instalacja wewnątrz kontenera

Jeśli wolisz nie kopiować plików ręcznie, możesz zainstalować plugin bezpośrednio w działającym kontenerze:

```bash
# wejdź do kontenera
docker exec -it -u node <nazwa_kontenera> sh

# zainstaluj z lokalnej ścieżki (jeśli masz volume)
cd /home/node/.n8n
mkdir -p custom
cd custom
npm init -y
npm install /home/node/.n8n/n8n-nodes-emailmd   # jeśli skopiowałeś katalog do volume

# lub z git (wymaga git w kontenerze)
npm install git+ssh://gitea@git.cynarski.pl:65522/n8n/emailmd.git
```

Po wyjściu z kontenera zrestartuj n8n:

```bash
docker compose restart n8n
```

#### Weryfikacja

Po uruchomieniu n8n wyszukaj w edytorze node o nazwie **"Send Email (Markdown)"** — jeśli się pojawi, instalacja przebiegła pomyślnie.

---

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
