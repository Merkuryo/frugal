# frugal

**Orquesta cualquier tarea con Claude con el menor gasto de tokens que aún dé un resultado verificado.**

[English](README.md)

frugal es un plugin para Claude Code y la app de Claude. Sirve para código, textos, investigación, análisis de datos y decisiones. Hace tres cosas:

1. **Mide cada tarea antes de gastar.** Hay tres niveles: L0 directo, L1 estándar y L2 profundo. Empieza por abajo y solo sube ante evidencia: un intento fallido, una sorpresa, algo que resulta importante.
2. **Asigna cada fase al modelo más barato que pueda hacerla.** Haiku lee, Sonnet ejecuta, Opus piensa y Sonnet comprueba. Opus recibe un resumen corto, no toda la conversación.
3. **Carga las instrucciones solo cuando hacen falta.** Un enrutador pequeño, un playbook por tarea y una hoja de principios de una página. Nada más ocupa contexto.

## Coste fijo frente a pstack

Medido con `node tools/budget.mjs` (caracteres ÷ 4, una aproximación a tokens) contra la versión de pstack para Claude Code, v0.9.134:

| | frugal 0.1.0 | pstack 0.9.134 |
|---|---:|---:|
| Siempre en contexto (descripciones de skills y agentes) | ~280 | ~4.100 |
| Gancho de inicio de sesión | ~90 | ~250 |
| Skill de entrada cargada en cada tarea | ~870 | ~7.200 |
| Texto total de skills | ~3.700 | ~163.000 |
| Skills / agentes | 3 / 4 | 67 / 4 |

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

`plugins/frugal/evals/` contiene cinco casos para el evaluador integrado de Claude Code:

- crear un script
- arreglar un bug
- analizar datos
- escribir un email
- una pregunta trivial en la que frugal **no** debe activarse

Cada caso se ejecuta con y sin el plugin. Los resultados principales son la diferencia de puntuación y el coste de cada versión:

```
claude plugin eval ./plugins/frugal --ablation with-without --allow-tools Write Edit Bash --no-publish
```

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
