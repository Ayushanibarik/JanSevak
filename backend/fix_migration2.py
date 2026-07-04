import os
import re

filepath = r'a:\constitution\backend\alembic\versions\aaad793a638b_initial_tables.py'

with open(filepath, 'r') as f:
    content = f.read()

# Remove the line with create_index for 'idx_complaints_geom'
content = re.sub(r"    op\.create_index\('idx_complaints_geom', 'complaints', \['geom'\], unique=False, postgresql_using='gist'\)\n", "", content)

# Remove the drop_index line just in case
content = re.sub(r"    op\.drop_index\('idx_complaints_geom', table_name='complaints', postgresql_using='gist'\)\n", "", content)

with open(filepath, 'w') as f:
    f.write(content)

print('Done')
