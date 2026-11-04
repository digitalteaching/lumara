# Erzeugt die Kurzanleitung für Lehrkräfte: python3 tools/kurzanleitung/bauen.py (im Repo-Wurzelordner).
# Das PDF wird mit eingecheckt (pakete/Lumara-Kurzanleitung.pdf), das Spiel selbst braucht dieses
# Werkzeug nicht. Neu bauen, wenn sich der KI-Prompt oder etwas Beschriebenes ändert.
# Braucht reportlab (pip install reportlab) und die macOS-Schriften Arial und Menlo.
# Die Bilder in bilder/ sind Bildschirmfotos aus dem iPad-Simulator und von lehrkraft.html.
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, Preformatted,
                                SimpleDocTemplate, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'pakete', 'Lumara-Kurzanleitung.pdf')
BASE = 'https://digitalteaching.github.io/lumara/'

SUP = '/System/Library/Fonts/Supplemental/'
pdfmetrics.registerFont(TTFont('Sans', SUP + 'Arial.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Bold', SUP + 'Arial Bold.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Italic', SUP + 'Arial Italic.ttf'))
pdfmetrics.registerFont(TTFont('Mono', '/System/Library/Fonts/Menlo.ttc', subfontIndex=0))
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='Sans-Bold', italic='Sans-Italic')

# Farben aus dem Spiel (Lehrkraft-Seite und Duell-Ansicht)
INK = colors.HexColor('#1d2a3a')
BROWN = colors.HexColor('#a8743a')
CREAM = colors.HexColor('#f3ecd2')
PAPER = colors.HexColor('#fbf6e6')
MUTED = colors.HexColor('#5b6470')

S = {
    'title': ParagraphStyle('title', fontName='Sans-Bold', fontSize=30, leading=34, textColor=INK),
    'sub': ParagraphStyle('sub', fontName='Sans', fontSize=14, leading=18, textColor=BROWN, spaceAfter=2),
    'meta': ParagraphStyle('meta', fontName='Sans', fontSize=9, leading=12, textColor=MUTED, spaceAfter=10),
    'h1': ParagraphStyle('h1', fontName='Sans-Bold', fontSize=15, leading=19, textColor=INK, spaceBefore=12, spaceAfter=5),
    'h2': ParagraphStyle('h2', fontName='Sans-Bold', fontSize=11.5, leading=15, textColor=INK, spaceBefore=8, spaceAfter=3),
    'body': ParagraphStyle('body', fontName='Sans', fontSize=10.5, leading=14.5, textColor=INK, spaceAfter=5, alignment=TA_LEFT),
    'bullet': ParagraphStyle('bullet', fontName='Sans', fontSize=10.5, leading=14.5, textColor=INK, leftIndent=14, bulletIndent=3, spaceAfter=3),
    'small': ParagraphStyle('small', fontName='Sans', fontSize=8.5, leading=11, textColor=MUTED),
    'caption': ParagraphStyle('caption', fontName='Sans-Italic', fontSize=8.5, leading=11, textColor=MUTED, spaceBefore=2),
    'cell': ParagraphStyle('cell', fontName='Sans', fontSize=10, leading=13, textColor=INK),
    'cellb': ParagraphStyle('cellb', fontName='Sans-Bold', fontSize=10, leading=13, textColor=INK),
    'code': ParagraphStyle('code', fontName='Mono', fontSize=8.6, leading=11.2, textColor=INK),
    'prompt': ParagraphStyle('prompt', fontName='Mono', fontSize=7.9, leading=10.1, textColor=INK),
}

W = A4[0] - 2 * 20 * mm  # nutzbare Breite


def picture(name):
    path = os.path.join(HERE, 'bilder', name)
    w, h = ImageReader(path).getSize()
    return path, w / h


def img(path_ratio, width):
    path, ratio = path_ratio
    return Image(path, width=width, height=width / ratio)


def p(text, style='body'):
    return Paragraph(text, S[style])


def bullets(items):
    return [Paragraph(t, S['bullet'], bulletText='•') for t in items]


def link(path=''):
    url = BASE + path
    return f'<link href="{url}" color="#a8743a"><u>{url.replace("https://", "")}</u></link>'


def box(flowables, bg=PAPER, border=BROWN, pad=9):
    t = Table([[flowables]], colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg), ('BOX', (0, 0), (-1, -1), 1.2, border),
        ('LEFTPADDING', (0, 0), (-1, -1), pad), ('RIGHTPADDING', (0, 0), (-1, -1), pad),
        ('TOPPADDING', (0, 0), (-1, -1), pad - 2), ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
    ]))
    return t


titel = picture('titel.jpg')
welt = picture('welt.jpg')
duell = picture('duell.jpg')
lehr = picture('lehrkraft.jpg')

story = []

# ── Seite 1 ──────────────────────────────────────────────────────────────
story += [
    p('Lumara', 'title'),
    p('Das Land unter dem Nebel – so funktioniert das Spiel', 'sub'),
    p('Kurzanleitung für Lehrkräfte · Spielfassung 1.0', 'meta'),
    img(titel, W),
    p('Der Titelbildschirm auf einem iPad', 'caption'),
    p('Was ist Lumara?', 'h1'),
    p('Lumara ist ein Lernspiel im Stil klassischer Pixel-Abenteuer. Die Kinder erkunden eine Insel, '
      'über der ein Nebel des Vergessens liegt. Den Nebel vertreiben sie mit Wissen: In Duellen '
      'beantworten sie Fragen.'),
    p('<b>Lumara selbst kennt kein Fach.</b> Alle Fragen kommen aus einem <b>Lernpaket</b>, einer '
      'einfachen Textdatei, die du selbst schreibst oder von einer KI schreiben lässt. So passt das '
      'Spiel zu jedem Fach und jedem Jahrgang.'),
    p('Das Spiel läuft im Browser, am besten auf dem iPad. Es gibt keine Anmeldung und keine Werbung, '
      'und keine Daten verlassen das Gerät.'),
    Spacer(1, 4),
    box([
        p('<b>Alle Links auf einen Blick</b>', 'cellb'),
        Spacer(1, 3),
        p(f'Spiel: {link()}', 'cell'),
        p(f'Für Lehrkräfte (Paket prüfen, Statistik): {link("lehrkraft.html")}', 'cell'),
        p(f'Ausführliche Anleitung: {link("anleitung.html")}', 'cell'),
        p(f'KI-Prompt: {link("pakete/KI-PROMPT-Lernpaket.md")}', 'cell'),
    ]),
    PageBreak(),
]

# ── Seite 2: So spielen die Kinder ──────────────────────────────────────
pics = Table([[img(welt, W * 0.47), img(duell, W * 0.47)],
              [p('Unterwegs auf der Insel, mit Steuerkreuz und A/B-Knöpfen', 'caption'),
               p('Ein Duell: Frage antippen, eintippen oder Satz bauen', 'caption')]],
             colWidths=[W * 0.5, W * 0.5])
pics.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                          ('RIGHTPADDING', (0, 0), (-1, -1), 0)]))
story += [
    p('So spielen die Kinder', 'h1'),
    *bullets([
        '<b>Start:</b> Das Kind lädt das Lernpaket, gibt seinen Namen ein und sucht sich ein Wesen aus. '
        'Ilvy am Leuchtturm erklärt den Rest. Eine Anleitung zum Lesen brauchen die Kinder nicht.',
        '<b>Acht Gebiete:</b> In jedem Gebiet wartet eine Hüterin oder ein Hüter mit einem Thema aus '
        'deinem Paket, von der Leuchtturmbucht bis zur Sternenwiese.',
        '<b>Duelle:</b> Jede richtige Antwort schwächt das gegnerische Wesen. Bei einer falschen Antwort '
        'gibt es eine zweite Chance, danach zeigt das Spiel die richtige Lösung.',
        '<b>Der Nebel weicht:</b> Wer eine Hüterin oder einen Hüter besiegt, bringt den Leuchtstein des '
        'Gebiets wieder zum Leuchten. Dann öffnet sich der Weg ins nächste Gebiet.',
        '<b>Unterwegs:</b> Wilde Wesen stellen Fragen aus den schon geschafften Themen und dem nächsten, '
        'so wird ganz nebenbei wiederholt. Unter Steinen liegen Zettel mit Fragen, dazu kommen kleine '
        'Aufträge und Geheimnisse. Das Wesen sammelt Erfahrung, steigt im Level auf und entwickelt sich.',
        '<b>Das Finale:</b> Hat das Paket alle acht Themen, wartet am Ende der Endgegner Morrow mit '
        'Fragen aus allen Themen. Besiegte Hüterinnen und Hüter bieten außerdem Revanchen an und werden '
        'dabei jedes Mal stärker.',
        '<b>Zeitdruck:</b> Ab dem vierten Gebiet läuft im Duell eine Uhr. Du stellst sie im Paket auf '
        '<i>normal</i>, <i>lang</i> oder <i>aus</i>.',
    ]),
    Spacer(1, 6),
    pics,
    PageBreak(),
]

# ── Seite 3: Lernpaket erstellen ────────────────────────────────────────
steps = [
    ('1', '<b>Prompt holen.</b> Er steht im Anhang dieses PDFs. Am saubersten kopierst du ihn online: '
          + link('pakete/KI-PROMPT-Lernpaket.md')),
    ('2', '<b>Teil 1 anpassen:</b> Schulform, Jahrgang, Fach, bis zu acht Themen, ein Titel und eine '
          '<b>KENNUNG</b> ohne Leerzeichen, zum Beispiel <i>mathe5-brueche</i>. Alles andere bleibt, wie es ist.'),
    ('3', '<b>Einer KI geben:</b> den ganzen Text, zum Beispiel an ChatGPT, Claude oder Gemini. Die Antwort '
          'speicherst du als reine Textdatei (.txt), etwa mit TextEdit (Format → In reinen Text umwandeln) '
          'oder dem Windows-Editor.'),
    ('4', '<b>Prüfen:</b> Auf der Seite für Lehrkräfte wählst du die Datei aus. Du siehst Fehler mit '
          'Zeilennummer, eine Übersicht pro Thema und kannst Probefragen in der echten Duell-Ansicht '
          'ausprobieren. Lies die Fragen auch fachlich durch, denn auch eine KI macht Fehler.'),
    ('5', '<b>Verteilen:</b> Gib die .txt-Datei über die Lernplattform, per AirDrop oder in einem '
          'geteilten Ordner weiter. Die Kinder legen sie in der App „Dateien“ ab und tippen in Lumara '
          'auf <b>„Lernpaket laden“</b>.'),
]
step_rows = [[Paragraph(n, ParagraphStyle('n', parent=S['cellb'], fontSize=15, leading=18, textColor=colors.white,
                                          alignment=1)), p(t, 'cell')] for n, t in steps]
step_table = Table(step_rows, colWidths=[9 * mm, W - 9 * mm])
step_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (0, -1), BROWN), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LINEBELOW', (0, 0), (-1, -2), 4, colors.white), ('BACKGROUND', (1, 0), (1, -1), PAPER),
    ('LEFTPADDING', (1, 0), (1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
]))

example = '\n'.join([
    'PAKET: Mathe Jahrgang 5 – Brüche',
    'KENNUNG: mathe5-brueche',
    'FACH: Mathe',
    '',
    '=== TRAINER 1 ===',
    'NAME: Maren',
    'THEMA: Brüche verstehen',
    'HALLO: Ahoi! Zeig mir, was du über Brüche weißt!',
    'SIEG: Stark! Du kennst dich mit Brüchen aus.',
    'NIEDERLAGE: Fast! Übe noch ein bisschen und komm wieder.',
    'REVANCHE: Schon wieder da? Diesmal bin ich bereit!',
    '',
    'FRAGE: Wie heißt die Zahl unter dem Bruchstrich?',
    'ANTWORT: Nenner',
    'FALSCH: Zähler | Teiler | Faktor',
])
forms = Table([
    [p('Im Paket steht …', 'cellb'), p('Im Spiel …', 'cellb')],
    [p('ANTWORT und mindestens 3 FALSCH', 'cell'), p('antippen (Auswahl) oder eintippen', 'cell')],
    [p('ANTWORT ohne FALSCH', 'cell'), p('eintippen, die Rechtschreibung zählt', 'cell')],
    [p('SATZ', 'cell'), p('einen Satz aus Wortkärtchen bauen', 'cell')],
], colWidths=[W * 0.45, W * 0.55])
forms.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), CREAM), ('BOX', (0, 0), (-1, -1), 0.8, BROWN),
    ('INNERGRID', (0, 0), (-1, -1), 0.4, BROWN), ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story += [
    p('In fünf Schritten zum eigenen Lernpaket', 'h1'),
    p('Ein Paket hat bis zu acht Themen, eines pro Gebiet. Jedes Thema braucht mindestens 8 Fragen, '
      'besser 20. Mit dem KI-Prompt geht es am schnellsten:'),
    step_table,
    Spacer(1, 6),
    KeepTogether([
        p('So sieht ein Lernpaket aus', 'h2'),
        box([Preformatted(example, S['code'])], bg=colors.white, border=CREAM),
        p('Jede Zeile beginnt mit einem Schlüsselwort und einem Doppelpunkt. Eine leere Zeile trennt '
          'zwei Fragen.', 'small'),
    ]),
    KeepTogether([p('Drei Antwortformen', 'h2'), forms]),
    PageBreak(),
]

# ── Seite 4: Prüfen und gut zu wissen ──────────────────────────────────
story += [
    p('Gut zu wissen', 'h1'),
    *bullets([
        '<b>Die KENNUNG nie ändern.</b> Solange sie gleich bleibt, gilt eine überarbeitete Datei als '
        'dasselbe Paket, und die Kinder behalten ihren Fortschritt.',
        '<b>Thema für Thema freigeben:</b> Du kannst mit zwei oder drei Themen anfangen. Gebiete ohne '
        'Thema bleiben im Nebel. Später ergänzt du weitere Themen in derselben Datei. Die Kinder laden sie '
        'unter Menü → Einstellungen → „Lernpaket wechseln“. Ihr Wesen und alles Gefundene bleiben.',
        '<b>Spielsprache:</b> Ist dein Paket für Englisch, Französisch oder Spanisch, läuft das ganze '
        'Spiel in dieser Sprache, sonst auf Deutsch. Das Spiel liest das Fach aus <i>FACH:</i>, oder du '
        'legst die Sprache mit <i>SPIELSPRACHE:</i> fest. Alles für Lehrkräfte bleibt auf Deutsch.',
        '<b>Auf dem iPad zuerst zum Home-Bildschirm:</b> Safari → Teilen → „Zum Home-Bildschirm“, dann '
        'Lumara von dort öffnen. So läuft das Spiel auch ohne WLAN, und der Spielstand bleibt sicher auf '
        'dem Gerät. Achtung: Die App auf dem Home-Bildschirm hat einen eigenen Speicher.',
        '<b>Spielstand sichern:</b> Unter Menü → Einstellungen → „Spielstand sichern“ speichert ein Kind '
        'seinen Stand als Datei, etwa vor einem Gerätewechsel. Mit „Spielstand laden“ geht es weiter.',
        '<b>Statistik prüfen:</b> Das Kind öffnet Menü → Einstellungen → „Für die Lehrkraft“. Dort stehen '
        'Level, gewonnene Duelle, Trefferquote je Thema, Spielzeit und ein Prüfcode. Du tippst die Werte '
        'auf der Seite für Lehrkräfte ab und siehst, ob sie echt sind. Der Prüfcode ist eine einfache '
        'Hürde gegen Mogeln, keine fälschungssichere Prüfung.',
        '<b>Datenschutz:</b> keine Anmeldung, keine Werbung, keine Tracker. Lernpaket und Spielstand '
        'bleiben auf dem Gerät des Kindes, nichts wird hochgeladen.',
    ]),
    Spacer(1, 6),
    KeepTogether([
        img(lehr, W * 0.82),
        p(f'Die Seite für Lehrkräfte: {link("lehrkraft.html")}', 'caption'),
    ]),
    PageBreak(),
]

# ── Anhang: der KI-Prompt ───────────────────────────────────────────────
prompt = open(os.path.join(ROOT, 'pakete/KI-PROMPT-Lernpaket.md'), encoding='utf-8').read().rstrip('\n')
story += [
    p('Anhang: Der KI-Prompt', 'h1'),
    p('Kopiere den ganzen Text unter dieser Zeile und passe nur <b>Teil 1</b> an. Online lässt er sich '
      f'ohne Seitenumbrüche kopieren: {link("pakete/KI-PROMPT-Lernpaket.md")}'),
    Spacer(1, 4),
    Preformatted(prompt, S['prompt']),
]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Sans', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 11 * mm, 'Lumara · Kurzanleitung für Lehrkräfte')
    canvas.drawRightString(A4[0] - 20 * mm, 11 * mm, f'Seite {doc.page}')
    canvas.setStrokeColor(CREAM)
    canvas.setLineWidth(0.8)
    canvas.line(20 * mm, 15 * mm, A4[0] - 20 * mm, 15 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm,
                        bottomMargin=20 * mm, title='Lumara – Kurzanleitung für Lehrkräfte',
                        author='Lumara', subject='So funktioniert Lumara, mit KI-Prompt')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print('geschrieben:', os.path.relpath(OUT, ROOT))
