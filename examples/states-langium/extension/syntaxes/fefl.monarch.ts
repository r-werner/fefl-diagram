// Monarch syntax highlighting for the fefl language.
export default {
    keywords: [
        'and','boolean','class','const','else','false','for','function','if','let','nil','number','or','print','return','string','super','this','true','void','while'
    ],
    operators: [
        '!','!=','*','+',',','-','.','/',':',';','<','<=','=','==','=>','>','>='
    ],
    symbols: /!|!=|\(|\)|\*|\+|,|-|\.|\/|:|;|<|<=|=|==|=>|>|>=|\{|\}/,

    tokenizer: {
        initial: [
            { regex: /[_a-zA-Z][\w_]*/, action: { cases: { '@keywords': {"token":"keyword"}, '@default': {"token":"ID"} }} },
            { regex: /[0-9]+(\.[0-9]+)?/, action: {"token":"number"} },
            { regex: /"[^"]*"/, action: {"token":"string"} },
            { include: '@whitespace' },
            { regex: /@symbols/, action: { cases: { '@operators': {"token":"operator"}, '@default': {"token":""} }} },
        ],
        whitespace: [
            { regex: /\s+/, action: {"token":"white"} },
            { regex: /\/\*/, action: {"token":"comment","next":"@comment"} },
            { regex: /\/\/[^\n\r]*/, action: {"token":"comment"} },
        ],
        comment: [
            { regex: /[^/\*]+/, action: {"token":"comment"} },
            { regex: /\*\//, action: {"token":"comment","next":"@pop"} },
            { regex: /[/\*]/, action: {"token":"comment"} },
        ],
    }
};
