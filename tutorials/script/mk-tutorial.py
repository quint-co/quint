#!/usr/bin/env python3
#
# Given Quint code that contains doc annotations, do the following:
#
#  - Translate the source code into a CodeTour file and a source file 
#    that does not contain the doc annotations.
#
#  - Translate the source code and the doc annotations to a tutorial in Markdown.
#
#  - Translate the source code and the doc annotations to a tmx-compatible
#    test suite in Markdown (TBD).
#
# Author: Igor Konnov, Informal Systems, 2023

import json
import os
import re
import sys

import xml.etree.ElementTree as ET
from enum import Enum

class PreproState(Enum):
    """A state of the text preprocessor"""
    # processing normal source code
    CODE = 1
    # processing a special comment /*! ... !*/
    DOC = 2

def read(filename, basename):
    """Read a Quint file into two buffers: the source code and the document"""

    comment_start = re.compile('^\s*/\*!\s*$')
    comment_end = re.compile('^\s*!\*/\s*$')
    # Collect the source code and the document in memory.
    # Our files are small, so this should work fine.
    code = []
    doc = []

    with open(filename, "r") as fi:
        line = fi.readline()
        state = PreproState.CODE
        codeLineNo = 0
        while line:
            if state == PreproState.CODE:
                if comment_start.match(line):
                    state = PreproState.DOC
                else:
                    code.append(line)
                    codeLineNo += 1
            elif state == PreproState.DOC:
                if comment_end.match(line):
                    state = PreproState.CODE
                else:
                    # replace $line with the line number in the code
                    ppline = \
                        line.replace("$line", str(codeLineNo)) \
                            .replace("$file", basename + ".qnt")
                    doc.append(ppline)
            else:
                assert(False)

            line = fi.readline()

    return (code, doc)


def xmlToCodetour(root):
    """Translate our XML representation to the CodeTour format"""
    
    def filterNone(d):
        # remove the entries (key, None) from a dictionary
        return { k: v for (k, v) in d.items() if v }

    def textOrNone(n):
        return n.text if n != None else None

    def intOrNone(n):
        return int(n.text) if n != None else None

    def description(n):
        text = n.text
        for c in n:
            if c.tag == "block":
                # just add the text
                text += f'\n{c.text}'
            elif c.tag == "run":
                # use the special syntax for shell commands in CodeTour
                text += f'\n>> {c.text}\n\n'

        return text

    tour = {
        "$schema": "https://aka.ms/codetour-schema",
        "title": root.find("title").text,
        "steps": [
            filterNone({
                "title": s.find("title").text,
                "description": description(s.find("description")),
                "line": intOrNone(s.find("line")),
                "file": textOrNone(s.find("file")),
                "pattern": textOrNone(s.find("pattern")),
            }) for s in root.find("steps").findall("step")
        ]
    }

    return tour


def xmlToMarkdown(root, code, out):
    """Translate our XML representation to a human-friendly Markdown"""

    def stepsStr(i):
        return "step" if i == 1 else "steps"
  
    title = root.find("title").text
    out.write(f'# {title}\n')
    allSteps = root.find("steps").findall("step")
    lastLine = None
    for (no, step) in enumerate(allSteps):
        title = step.find("title").text
        out.write(f'## {no + 1}. {title}\n\n')
        stepsLeft = len(allSteps) - no
        out.write(f'*{stepsLeft} more {stepsStr(stepsLeft)} to the finish line*\n')
        # extract the text and the code from the description block
        desc = step.find("description")
        out.write(f'{desc.text}\n')
        for c in desc:
            if c.tag == "block":
                out.write(f'{c.text}\n')
            elif c.tag == "run":
                # use the special syntax for shell commands in CodeTour
                out.write(f'\n```sh\n')
                out.write(f'{c.text}\n')
                out.write(f'```\n\n')

        # insert a piece of code
        line = step.find("line")
        line = int(line.text) if line != None else None
        # the first step is normally an intro, its code will be skipped
        if line != None and lastLine != None:
            out.write('**Example:**\n\n')
            out.write('```scala\n')
            for l in code[int(lastLine) + 1: int(line)]:
                out.write(l)

            out.write('```\n\n')
          
        # update the last line, so it can be used in the next iteration
        lastLine = line

    out.write("# Done!\n")
    text = \
      """
  You have made it!

  Submit to us the secret codes that you have found in
  this tutorial, and we will place you on the scoreboard.
      """
    out.write(text)


def translate(inputFilename, basename):
    """Translate a Quint file and its comments into various output files"""

    (code, doc) = read(inputFilename, basename)
    with open(basename + ".qnt", "w+") as fo:
        for l in code:
            fo.write(l)

    with open(basename + ".xml", "w+") as fo:
        for l in doc:
            fo.write(l)

    # parse the doc as XML
    root = ET.fromstring(''.join(doc))
    assert(root.tag == "tutorial")

    tour = xmlToCodetour(root)
    with open(basename + ".tour", "w+") as fo:
        fo.write(json.dumps(tour, indent=2))

    with open(basename + ".md", "w+") as fo:
        xmlToMarkdown(root, code, fo)


if __name__ == "__main__":
    cmd, args = sys.argv[0], sys.argv[1:]
    if len(args) != 2:
        print(f"Use: {cmd} input.qnt basename")
        sys.exit(1)

    translate(args[0], args[1])

