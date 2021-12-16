/******************************************************************************
 * This file was generated by langium-cli 0.3.0-next.5e9d27d.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { loadGrammar, Grammar } from 'langium';

let loadedStatesGrammar: Grammar | undefined;
export const StatesGrammar = (): Grammar => loadedStatesGrammar ||(loadedStatesGrammar = loadGrammar(`{
  "$type": "Grammar",
  "usedGrammars": [],
  "hiddenTokens": [],
  "imports": [],
  "rules": [
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "StateMachine",
      "hiddenTokens": [],
      "entry": true,
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "statemachine",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          },
          {
            "$type": "Alternatives",
            "elements": [
              {
                "$type": "Assignment",
                "feature": "states",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "State"
                  }
                },
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "events",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Event"
                  }
                },
                "elements": []
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "State",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "state",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          },
          {
            "$type": "Assignment",
            "feature": "transitions",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Transition"
              }
            },
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Event",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "event",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Transition",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "event",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "Event"
              }
            },
            "elements": []
          },
          {
            "$type": "Keyword",
            "value": "=>"
          },
          {
            "$type": "Assignment",
            "feature": "state",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "State"
              }
            }
          }
        ]
      }
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "WS",
      "terminal": {
        "$type": "RegexToken",
        "regex": "\\\\s+",
        "elements": []
      }
    },
    {
      "$type": "TerminalRule",
      "name": "ID",
      "terminal": {
        "$type": "RegexToken",
        "regex": "[_a-zA-Z][\\\\w_]*",
        "elements": []
      }
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "ML_COMMENT",
      "terminal": {
        "$type": "RegexToken",
        "regex": "\\\\/\\\\*[\\\\s\\\\S]*?\\\\*\\\\/",
        "elements": []
      }
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "SL_COMMENT",
      "terminal": {
        "$type": "RegexToken",
        "regex": "\\\\/\\\\/[^\\\\n\\\\r]*",
        "elements": []
      }
    }
  ],
  "name": "States"
}`));
