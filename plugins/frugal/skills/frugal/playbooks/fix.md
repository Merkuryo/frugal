# Fix: something is broken or wrong

1. **Reproduce first.** Get the failure on the real surface: a failing command, test, page or wrong number. No repro, no fix; say what you tried.
2. **Locate.** `scout` greps logs and code for the error and returns file:line candidates. Read only those ranges.
3. **One hypothesis, one test.** State the suspected cause and the cheapest check that would refute it. Run the check.
4. **Fix the root cause** with the smallest change. Add a regression test or check when the medium allows it.
5. **Rerun the reproduction.** It must now pass, and nearby behavior must still work.
6. **Escalate on evidence.** If a fix fails, apply *Attack the premise*. After two failed fixes on the same premise, move to L2: send `thinker` the repro, the two failed fixes and the evidence, and ask for the premise that is wrong.
7. **Report.** Cause, fix, proof (before/after), risks.
