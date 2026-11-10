# frugal

**Orquesta cualquier tarea con Claude con el menor gasto de tokens que aún dé un resultado verificado.**

[English](README.md)

frugal es un plugin para Claude Code y la app de Claude. Sirve para código, textos, investigación, análisis de datos y decisiones. Hace tres cosas:

1. **Mide cada tarea antes de gastar.** Hay tres niveles: L0 directo, L1 estándar y L2 profundo. Empieza por abajo y solo sube ante evidencia: un intento fallido, una sorpresa, algo que resulta importante.
2. **Asigna cada fase al modelo más barato que pueda hacerla.** Haiku lee, Sonnet ejecuta, Opus piensa y Sonnet comprueba. Opus recibe un resumen corto, no toda la conversación.
3. **Carga las instrucciones solo cuando hacen falta.** Un enrutador pequeño, un playbook por tarea y una hoja de principios de una página. Nada más ocupa contexto.

## Coste fijo frente a pstack

Coste en tokens estimado por la propia herramienta de Claude Code, `claude plugin details`, para frugal 0.1.2 y la versión de pstack para Claude Code, v0.9.134:

| | frugal | pstack |
|---|---:|---:|
| Añadido a cada sesión | ~400 | ~4.200 |
| Skill de entrada, cada vez que se invoca | ~790 | ~7.100 |
| Skills / agentes | 3 / 4 | 67 / 4 |
| Texto total de skills (`node tools/budget.mjs`, caracteres ÷ 4) | ~3.700 | ~163.000 |

Estas cifras son un **mínimo**. Solo miden lo que el plugin añade al contexto, no lo bien que se hacen las tareas. Para la calidad y el coste de ejecuciones completas, mira [Evaluaciones](#evaluaciones).

## Instalación

**Claude Code**

```
/plugin marketplace add Merkuryo/frugal
/plugin install frugal@frugal
```

Opcional: ejecuta `/frugal-setup` para elegir el modelo de cada fase, añadir tus propios puntos de aprobación y activar la barra de tokens.

**App de Claude:** descarga `frugal.plugin` de la última release y añádelo como plugin. Las skills y los playbooks funcionan igual. Si la app no puede lanzar subagentes, frugal hace cada fase él mismo, en el mismo orden.

## Cómo funciona

```
tarea ─► medir (L0 / L1 / L2) ─► un playbook ─► leer (haiku) ─► hacer (sonnet) ─► pensar (opus, solo si hace falta) ─► comprobar (sonnet) ─► informe corto
```

| Pieza | Qué es |
|---|---|
| `skills/frugal` | El enrutador: niveles, tabla de playbooks, modelos por fase, reglas de contexto, puntos de aprobación y verificación |
| `playbooks/` | `build`, `fix`, `research`, `write`, `analyze`, `decide` y `review`, de 6 a 8 pasos cada uno |
| `references/principles.md` | Unas 20 reglas de una línea: hacer menos, pensar bien, demostrarlo, gastar con cabeza |
| `agents/` | `scout` (haiku, solo lectura), `worker` (sonnet), `thinker` (opus) y `checker` (sonnet) |
| `frugal-setup` | Escribe la hoja de configuración: modelos, puntos de aprobación, nivel máximo, gancho de inicio y barra de tokens |
| `frugal-learn` | Guarda hasta tres lecciones de una línea por sesión en `.frugal/lessons.md` |
| `statusline/` | Muestra en la barra de estado de Claude Code el modelo, los tokens de entrada y salida, la caché y el coste |

### Hoja de configuración

Va en `.frugal/config.md` (para un proyecto) o en `~/.claude/frugal.md` (para todos):

```markdown
# frugal config

scout: haiku
worker: sonnet
thinker: opus
checker: sonnet
panel: off
ceiling: L2
gates: cambios de estrategia, cualquier cosa en producción
session hook: on
```

Pedir aprobación antes de acciones irreversibles o hacia fuera (borrar, force-push, enviar, publicar, pagar, producción) está siempre activo.

## Evaluaciones

`plugins/frugal/evals/` contiene casos para el evaluador integrado de Claude Code. Cada caso se ejecuta con y sin el plugin. Los resultados principales son la diferencia de puntuación y el coste de cada versión.

- **Tareas pequeñas** (01–05): crear un script, arreglar un bug, analizar datos incluidos en el mensaje, escribir un email y una pregunta trivial. Aquí frugal está pensado para no intervenir (L0), así que estos casos comprueban que no empeora nada.
- **Tareas multipaso** (06–09, etiqueta `multistep`):
  - una función nueva que toca tres archivos de un paquete con tests;
  - un bug cuyo síntoma y cuya causa están en archivos distintos;
  - un análisis sobre un CSV de unas 13.000 filas en disco;
  - una causa raíz enterrada en un log de 6 MB.

  Cada caso prepara sus archivos con un script `scaffold.sh`. Es aquí donde frugal debe activarse y ahorrar tokens.

```
# casos multipaso (los scaffold crean los archivos del proyecto)
claude plugin eval ./plugins/frugal --tag multistep --scaffold --allow-tools Write Edit Bash --no-publish

# todos
claude plugin eval ./plugins/frugal --scaffold --allow-tools Write Edit Bash --no-publish
```

Para comparar con pstack en los mismos casos (tres brazos: sin plugin, frugal y pstack), ejecuta `tools/compare-pstack.sh --tag multistep --runs 1`.

Empieza con `--runs 1` para comprobar que frugal se activa (indicador `router-fired`) y después usa las 3 ejecuciones por defecto para tener cifras fiables.

Todavía no hay resultados publicados.

## Desarrollo

```
node --test tests/*.test.mjs                                   # tests unitarios
node tools/budget.mjs plugins/frugal --entry frugal --check    # control del presupuesto de tokens
claude plugin validate plugins/frugal                          # manifiesto y componentes
```

La CI ejecuta las tres comprobaciones en cada push. Un cambio que se pase del presupuesto de tokens rompe la build.

## Créditos

Varios principios y la idea de los playbooks vienen de [pstack](https://github.com/michael-denyer/pstack-claude), de Lauren Tan (poteto), con licencia MIT. Ver [NOTICE.md](NOTICE.md).

## Licencia

MIT
