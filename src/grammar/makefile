# Description: Makefile for the Free42 parser generator
PEGGY := npx peggy

.PHONY: peggy-help
peggy-help:
	$(PEGGY) --help

.PHONY: peggy-version
peggy-version:
	$(PEGGY) --version

.PHONY: peggy-generate-parsers
peggy-generate-parsers: peggy-version peggy-generate-parser-rpn peggy-generate-parser-raw
	echo "peggy generate parser rpn/raw done"

.PHONY: peggy-generate-parser-raw
peggy-generate-parser-raw:
	$(PEGGY) -o ../decoder/RawProgParser.js ./RawProgParser.peggy

.PHONY: peggy-generate-parser-rpn
peggy-generate-parser-rpn:
	$(PEGGY) -o ../encoder/RpnProgParser.js ./RpnProgParser.peggy


.PHONY: peggy-test-parser
peggy-test-parser: peggy-test-rpn peggy-test-raw
	echo "peggy test rpn/raw.hex done"

.PHONY: peggy-test-raw
peggy-test-raw:
	$(PEGGY) -T ./test.raw.hex ./RawProgParser.peggy

.PHONY: peggy-test-rpn
peggy-test-rpn:
	$(PEGGY) -T ./test.free42 ./RpnProgParser.peggy
