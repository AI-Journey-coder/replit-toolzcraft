import json
import sqlglot
from sqlglot import exp
from sqlglot.dialects.postgres import Postgres
from sqlglot.errors import ErrorLevel

class Db2Subset(Postgres):
    """Explicitly limited DB2 SELECT adapter, not a complete IBM SQL grammar."""
    class Generator(Postgres.Generator):
        LIMIT_IS_TOP = False
        def limit_sql(self, expression, top=False):
            return "FETCH FIRST " + self.sql(expression, "expression") + " ROWS ONLY"

def convert_sql(payload):
    source, target, query = payload['source'], payload['target'], payload['sql']
    supported = {'oracle','tsql','mysql','postgres','sqlite','snowflake','bigquery','duckdb','redshift','spark','trino','db2'}
    if source not in supported or target not in supported:
        raise ValueError('Unsupported dialect selection.')
    if len(query) > 100000:
        raise ValueError('Limit SQL input to 100,000 characters.')
    read = Db2Subset if source == 'db2' else source
    write = Db2Subset if target == 'db2' else target
    trees = sqlglot.parse(query, read=read, error_level=ErrorLevel.RAISE)
    if not trees or all(t is None for t in trees):
        raise ValueError('Enter a SQL statement.')
    warnings = ['Generated SQL has not been executed. Validate it against your database version, schema and test data.']
    output=[]
    for tree in trees:
        if tree is None: continue
        if isinstance(tree, (exp.Command, exp.Block)):
            raise ValueError('Procedural SQL and unparsed commands require manual migration.')
        if source == 'db2' or target == 'db2':
            if not isinstance(tree, (exp.Select, exp.Union, exp.Intersect, exp.Except)):
                raise ValueError('DB2 currently supports a limited SELECT/set-query subset only; DDL and procedural SQL require manual migration.')
            unsupported = (exp.Anonymous, exp.Offset, exp.DateAdd, exp.DateDiff, exp.DateTrunc, exp.Interval, exp.Cast, exp.Window)
            if any(isinstance(node, unsupported) for node in tree.walk()):
                raise ValueError('This DB2 query contains functions, casts, offsets or window operations outside the supported subset. Manual conversion is required.')
            warnings.append('DB2 support is experimental: basic SELECT, joins, filters, grouping, ordering, set operations and FETCH FIRST. It does not cover all IBM database variants.')
        output.append(tree.sql(dialect=write, pretty=True, unsupported_level=ErrorLevel.RAISE))
    return json.dumps({'sql': ';\n\n'.join(output)+';', 'warnings': list(dict.fromkeys(warnings))})
