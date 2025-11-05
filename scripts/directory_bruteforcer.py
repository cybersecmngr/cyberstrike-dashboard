#!/usr/bin/env python3
"""
Directory Bruteforcer
Bruteforces directories and files on web servers
"""

import sys
import json
import requests
import subprocess
from typing import List, Dict
from urllib.parse import urljoin

def bruteforce_directories(url: str, wordlist: str = 'common') -> List[Dict]:
    """Bruteforce directories using wordlist"""
    results = []
    
    # Common wordlists
    common_dirs = [
        'admin', 'administrator', 'api', 'backup', 'config', 'database', 'db',
        'dev', 'development', 'docs', 'documentation', 'download', 'downloads',
        'files', 'ftp', 'images', 'img', 'includes', 'index', 'js', 'lib',
        'login', 'logs', 'mail', 'media', 'old', 'php', 'phpmyadmin',
        'private', 'public', 'secure', 'server', 'sql', 'src', 'static',
        'test', 'tmp', 'uploads', 'user', 'users', 'www', 'xml',
        'wp-admin', 'wp-content', 'wp-includes', '.git', '.svn', '.env',
        'config.php', 'config.inc.php', 'database.php', 'settings.php',
    ]
    
    medium_dirs = common_dirs + [
        'assets', 'assets/css', 'assets/js', 'assets/images', 'bin', 'cache',
        'cgi-bin', 'cgi', 'classes', 'components', 'css', 'data', 'database',
        'export', 'export', 'files', 'fonts', 'help', 'images', 'import',
        'inc', 'include', 'includes', 'install', 'javascript', 'js',
        'libs', 'library', 'local', 'locale', 'modules', 'pages', 'panel',
        'plugins', 'resources', 'scripts', 'sessions', 'setup', 'sites',
        'source', 'storage', 'system', 'themes', 'tools', 'vendor', 'web',
    ]
    
    large_dirs = medium_dirs + [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c',
        'about', 'account', 'accounts', 'action', 'actions', 'ad', 'add',
        'admin.php', 'admin.html', 'admin/', 'ajax', 'analytics', 'app',
        'application', 'apps', 'archive', 'archives', 'auth', 'author',
        'blog', 'blogs', 'board', 'boards', 'book', 'books', 'browse',
        'calendar', 'cart', 'catalog', 'category', 'categories', 'chat',
        'checkout', 'client', 'clients', 'comment', 'comments', 'contact',
        'content', 'control', 'controls', 'copyright', 'count', 'create',
        'dashboard', 'date', 'default', 'delete', 'demo', 'design', 'detail',
        'details', 'directory', 'directories', 'discussion', 'discussions',
        'display', 'doc', 'domain', 'domains', 'edit', 'email', 'emails',
        'entry', 'entries', 'error', 'errors', 'event', 'events', 'example',
        'faq', 'faqs', 'feature', 'features', 'feed', 'feeds', 'file',
        'filter', 'filters', 'find', 'folder', 'folders', 'form', 'forms',
        'forum', 'forums', 'friend', 'friends', 'gallery', 'game', 'games',
        'group', 'groups', 'guest', 'guests', 'guide', 'guides', 'home',
        'host', 'hosts', 'html', 'http', 'https', 'icon', 'icons', 'id',
        'image', 'images', 'info', 'information', 'input', 'install',
        'item', 'items', 'job', 'jobs', 'join', 'key', 'keys', 'language',
        'languages', 'last', 'latest', 'link', 'links', 'list', 'lists',
        'live', 'load', 'local', 'location', 'locations', 'lock', 'log',
        'login.php', 'login.html', 'logout', 'main', 'manage', 'manager',
        'map', 'maps', 'mark', 'market', 'markets', 'member', 'members',
        'menu', 'menus', 'message', 'messages', 'method', 'methods', 'min',
        'model', 'models', 'more', 'most', 'move', 'name', 'names', 'nav',
        'navigation', 'new', 'news', 'next', 'node', 'nodes', 'note',
        'notes', 'notify', 'number', 'numbers', 'old', 'online', 'open',
        'option', 'options', 'order', 'orders', 'org', 'orgs', 'other',
        'others', 'over', 'overview', 'page', 'pages', 'parent', 'parents',
        'part', 'parts', 'password', 'passwords', 'path', 'paths', 'pay',
        'payment', 'payments', 'photo', 'photos', 'picture', 'pictures',
        'place', 'places', 'plan', 'plans', 'play', 'plugin', 'plugins',
        'point', 'points', 'policy', 'policies', 'pop', 'popup', 'popups',
        'post', 'posts', 'power', 'powers', 'pre', 'preview', 'previews',
        'price', 'prices', 'print', 'private', 'process', 'processes',
        'product', 'products', 'profile', 'profiles', 'program', 'programs',
        'project', 'projects', 'public', 'publish', 'purchase', 'purchases',
        'query', 'queries', 'question', 'questions', 'quick', 'quote',
        'quotes', 'random', 'range', 'ranges', 'rate', 'rates', 'rating',
        'ratings', 'read', 'reader', 'readers', 'reading', 'readings',
        'real', 'record', 'records', 'red', 'redirect', 'redirects',
        'ref', 'refer', 'referer', 'referers', 'refs', 'register',
        'registers', 'related', 'relation', 'relations', 'relative',
        'relatives', 'release', 'releases', 'reload', 'remove', 'removed',
        'rename', 'rent', 'rents', 'reply', 'replies', 'report', 'reports',
        'request', 'requests', 'require', 'required', 'requires', 'reset',
        'resize', 'resource', 'resources', 'response', 'responses', 'rest',
        'result', 'results', 'return', 'returns', 'review', 'reviews',
        'right', 'rights', 'root', 'route', 'routes', 'rule', 'rules',
        'run', 'safe', 'safety', 'sale', 'sales', 'sample', 'samples',
        'save', 'saved', 'saves', 'saving', 'say', 'scale', 'scales',
        'scan', 'scans', 'scene', 'scenes', 'schedule', 'schedules', 'scope',
        'scopes', 'score', 'scores', 'screen', 'screens', 'script', 'scripts',
        'scroll', 'search', 'searches', 'second', 'seconds', 'section',
        'sections', 'secure', 'security', 'see', 'seek', 'seem', 'select',
        'selected', 'selects', 'self', 'sell', 'sells', 'send', 'sends',
        'sense', 'sent', 'separate', 'series', 'serious', 'serve', 'server',
        'servers', 'service', 'services', 'session', 'sessions', 'set',
        'sets', 'setting', 'settings', 'setup', 'seven', 'several', 'shall',
        'shape', 'share', 'shared', 'shares', 'sharp', 'sheet', 'sheets',
        'shell', 'shelves', 'ship', 'ships', 'shirt', 'shirts', 'shock',
        'shoe', 'shoes', 'shoot', 'shop', 'shops', 'short', 'shot',
        'shots', 'should', 'shoulder', 'shoulders', 'shout', 'show',
        'showed', 'shower', 'showers', 'shows', 'shut', 'sick', 'side',
        'sides', 'sight', 'sights', 'sign', 'signal', 'signals', 'signed',
        'signs', 'silent', 'silk', 'silly', 'silver', 'similar', 'simple',
        'simply', 'since', 'sing', 'single', 'sink', 'sir', 'sister',
        'sisters', 'sit', 'sits', 'sitting', 'situation', 'situations',
        'six', 'size', 'sized', 'sizes', 'skill', 'skills', 'skin',
        'skins', 'sky', 'sleep', 'sleeps', 'slept', 'slide', 'slides',
        'slight', 'slightly', 'slip', 'slipped', 'slips', 'slow', 'slowly',
        'small', 'smaller', 'smallest', 'smile', 'smiled', 'smiles',
        'smoke', 'smoked', 'smokes', 'smooth', 'snake', 'snakes', 'snow',
        'snows', 'so', 'soap', 'soaps', 'social', 'society', 'sock',
        'socks', 'soft', 'software', 'soil', 'soils', 'solar', 'sold',
        'solid', 'solve', 'solved', 'solves', 'some', 'somebody', 'somehow',
        'someone', 'something', 'sometimes', 'somewhere', 'son', 'song',
        'songs', 'sons', 'soon', 'sooner', 'soonest', 'sore', 'sorrow',
        'sorry', 'sort', 'sorts', 'soul', 'souls', 'sound', 'sounded',
        'sounds', 'soup', 'soups', 'sour', 'source', 'sources', 'south',
        'southern', 'space', 'spaces', 'spare', 'speak', 'speaker',
        'speakers', 'speaks', 'special', 'specific', 'speech', 'speeches',
        'speed', 'speeds', 'spell', 'spells', 'spend', 'spent', 'spider',
        'spiders', 'spirit', 'spirits', 'spite', 'split', 'splits',
        'spoken', 'sport', 'sports', 'spot', 'spots', 'spread', 'spreads',
        'spring', 'springs', 'square', 'squares', 'stage', 'stages',
        'stairs', 'stamp', 'stamps', 'stand', 'standard', 'standards',
        'standing', 'stands', 'star', 'stared', 'stares', 'stars', 'start',
        'started', 'starting', 'starts', 'state', 'stated', 'statement',
        'statements', 'states', 'station', 'stations', 'stay', 'stayed',
        'staying', 'stays', 'steady', 'steal', 'steals', 'steam', 'steams',
        'steel', 'steels', 'step', 'steps', 'stick', 'sticks', 'sticky',
        'stiff', 'still', 'sting', 'stings', 'stir', 'stirs', 'stock',
        'stocks', 'stomach', 'stomachs', 'stone', 'stones', 'stood',
        'stool', 'stools', 'stop', 'stopped', 'stopping', 'stops', 'store',
        'stored', 'stores', 'stories', 'stork', 'storks', 'storm', 'storms',
        'story', 'straight', 'strange', 'stranger', 'strangers', 'straw',
        'straws', 'stream', 'streams', 'street', 'streets', 'strength',
        'stretch', 'stretches', 'strike', 'strikes', 'string', 'strings',
        'strip', 'strips', 'strong', 'stronger', 'strongest', 'struck',
        'structure', 'structures', 'struggle', 'struggles', 'stuck',
        'student', 'students', 'studied', 'studies', 'study', 'studying',
        'stuff', 'stuffs', 'stupid', 'style', 'styles', 'subject',
        'subjects', 'succeed', 'succeeds', 'success', 'successful', 'such',
        'sudden', 'suddenly', 'suffer', 'suffers', 'sugar', 'sugars',
        'suggest', 'suggests', 'suit', 'suite', 'suites', 'suits',
        'sum', 'summer', 'summers', 'sums', 'sun', 'sunday', 'sundays',
        'sung', 'sunk', 'sunny', 'suns', 'sunshine', 'super', 'supper',
        'suppers', 'supply', 'supplies', 'support', 'supports', 'suppose',
        'supposes', 'sure', 'surely', 'surface', 'surfaces', 'surprise',
        'surprises', 'surround', 'surrounds', 'swallow', 'swallows',
        'swam', 'swamp', 'swamps', 'swan', 'swans', 'swear', 'swears',
        'sweat', 'sweats', 'sweep', 'sweeps', 'sweet', 'sweeter',
        'sweetest', 'swept', 'swift', 'swim', 'swimming', 'swims', 'swing',
        'swings', 'switch', 'switches', 'sword', 'swords', 'swore',
        'sworn', 'swung', 'syllable', 'syllables', 'symbol', 'symbols',
        'sympathy', 'system', 'systems', 'table', 'tables', 'tablet',
        'tablets', 'tail', 'tails', 'take', 'taken', 'takes', 'taking',
        'tale', 'tales', 'talk', 'talked', 'talking', 'talks', 'tall',
        'taller', 'tallest', 'tank', 'tanks', 'tap', 'taps', 'tape',
        'tapes', 'task', 'tasks', 'taste', 'tasted', 'tastes', 'taught',
        'tax', 'taxes', 'tea', 'teach', 'teacher', 'teachers', 'teaches',
        'team', 'teams', 'tear', 'tears', 'teeth', 'telephone',
        'telephones', 'tell', 'telling', 'tells', 'temperature',
        'temperatures', 'ten', 'tent', 'tents', 'term', 'terms', 'terrible',
        'test', 'tests', 'than', 'thank', 'thanked', 'thanks', 'that',
        'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
        'therefore', 'these', 'they', 'thick', 'thicker', 'thickest',
        'thin', 'thinner', 'thinnest', 'thing', 'things', 'think',
        'thinking', 'thinks', 'third', 'thirsty', 'thirteen', 'thirty',
        'this', 'those', 'though', 'thought', 'thoughts', 'thousand',
        'thousands', 'thread', 'threads', 'three', 'threw', 'throat',
        'throats', 'through', 'throughout', 'throw', 'throws', 'thrown',
        'thumb', 'thumbs', 'thunder', 'thunders', 'thursday', 'thursdays',
        'thus', 'tick', 'ticket', 'tickets', 'tide', 'tides', 'tie',
        'tied', 'ties', 'tiger', 'tigers', 'tight', 'tighter', 'tightest',
        'till', 'time', 'times', 'tin', 'tiny', 'tip', 'tips', 'tire',
        'tired', 'tires', 'title', 'titles', 'to', 'tobacco', 'today',
        'toe', 'toes', 'together', 'told', 'tomorrow', 'tone', 'tones',
        'tongue', 'tongues', 'tonight', 'too', 'took', 'tool', 'tools',
        'tooth', 'top', 'tops', 'topic', 'topics', 'tore', 'torn',
        'total', 'totals', 'touch', 'touched', 'touches', 'tough',
        'tour', 'tours', 'toward', 'towards', 'tower', 'towers', 'town',
        'towns', 'toy', 'toys', 'trace', 'traces', 'track', 'tracks',
        'trade', 'trades', 'trail', 'trails', 'train', 'trained',
        'training', 'trains', 'transport', 'transports', 'trap', 'traps',
        'travel', 'traveled', 'traveling', 'travels', 'tray', 'trays',
        'treasure', 'treasures', 'treat', 'treated', 'treating', 'treats',
        'tree', 'trees', 'tremble', 'trembles', 'tribe', 'tribes',
        'trick', 'tricks', 'tried', 'tries', 'trip', 'trips', 'troop',
        'troops', 'tropical', 'trouble', 'troubles', 'truck', 'trucks',
        'true', 'truly', 'trunk', 'trunks', 'trust', 'trusts', 'truth',
        'truths', 'try', 'trying', 'tube', 'tubes', 'tuesday', 'tuesdays',
        'tune', 'tunes', 'tunnel', 'tunnels', 'turn', 'turned', 'turning',
        'turns', 'twelve', 'twenty', 'twice', 'twin', 'twins', 'two',
        'type', 'types', 'typical', 'ugly', 'umbrella', 'umbrellas',
        'unable', 'uncle', 'uncles', 'under', 'underneath', 'understand',
        'understands', 'understood', 'unfair', 'unfortunate', 'unhappy',
        'uniform', 'uniforms', 'unit', 'units', 'universe', 'universes',
        'unknown', 'unless', 'until', 'unusual', 'up', 'upon', 'upper',
        'upset', 'upsets', 'upside', 'upstairs', 'upward', 'upwards',
        'urge', 'urges', 'urgent', 'us', 'use', 'used', 'useful',
        'useless', 'uses', 'using', 'usual', 'usually', 'valley',
        'valleys', 'valuable', 'value', 'valued', 'values', 'vapor',
        'vapors', 'variety', 'various', 'vast', 'vegetable', 'vegetables',
        'vehicle', 'vehicles', 'venture', 'ventures', 'verb', 'verbs',
        'verse', 'verses', 'very', 'vessel', 'vessels', 'victory',
        'victories', 'view', 'viewed', 'viewing', 'views', 'village',
        'villages', 'violence', 'violent', 'visit', 'visited', 'visiting',
        'visits', 'visitor', 'visitors', 'voice', 'voices', 'volume',
        'volumes', 'vote', 'voted', 'votes', 'voting', 'wages', 'wagon',
        'wagons', 'waist', 'waists', 'wait', 'waited', 'waiting', 'waits',
        'wake', 'wakes', 'walk', 'walked', 'walking', 'walks', 'wall',
        'walls', 'wander', 'wanders', 'want', 'wanted', 'wanting', 'wants',
        'war', 'warm', 'warmer', 'warmest', 'warn', 'warned', 'warning',
        'warnings', 'warns', 'wars', 'was', 'wash', 'washed', 'washes',
        'waste', 'wasted', 'wastes', 'watch', 'watched', 'watches',
        'water', 'waters', 'wave', 'waved', 'waves', 'waving', 'wax',
        'waxes', 'way', 'ways', 'we', 'weak', 'weaker', 'weakest',
        'wealth', 'weapon', 'weapons', 'wear', 'wearing', 'wears', 'wore',
        'worn', 'weather', 'weave', 'weaves', 'wedding', 'weddings',
        'wednesday', 'wednesdays', 'weed', 'weeds', 'week', 'weeks',
        'weep', 'weeps', 'weigh', 'weighs', 'weight', 'weights', 'welcome',
        'welcomed', 'welcomes', 'welcoming', 'well', 'wells', 'went',
        'were', 'west', 'western', 'wet', 'wetter', 'wettest', 'whale',
        'whales', 'what', 'whatever', 'wheat', 'wheel', 'wheels', 'when',
        'whenever', 'where', 'wherever', 'whether', 'which', 'while',
        'whistle', 'whistles', 'white', 'whiter', 'whitest', 'who',
        'whole', 'whom', 'whose', 'why', 'wide', 'wider', 'widest',
        'wife', 'wives', 'wild', 'wilder', 'wildest', 'will', 'willing',
        'wills', 'win', 'wind', 'winding', 'winds', 'window', 'windows',
        'wine', 'wines', 'wing', 'wings', 'wink', 'winks', 'winner',
        'winners', 'wins', 'winter', 'winters', 'wipe', 'wiped', 'wipes',
        'wire', 'wires', 'wise', 'wiser', 'wisest', 'wish', 'wished',
        'wishes', 'wishing', 'wit', 'with', 'within', 'without', 'wits',
        'wolf', 'wolves', 'woman', 'women', 'won', 'wonder', 'wondered',
        'wonderful', 'wonders', 'wood', 'woods', 'wooden', 'wool', 'wools',
        'word', 'words', 'wore', 'work', 'worked', 'worker', 'workers',
        'working', 'works', 'world', 'worlds', 'worn', 'worry', 'worries',
        'worse', 'worst', 'worth', 'would', 'wound', 'wounded', 'wounds',
        'wrap', 'wrapped', 'wraps', 'wreck', 'wrecks', 'wring', 'wrings',
        'wrist', 'wrists', 'write', 'writer', 'writers', 'writes',
        'writing', 'writings', 'written', 'wrong', 'wrote', 'yard',
        'yards', 'yarn', 'yarns', 'year', 'years', 'yellow', 'yellower',
        'yellowest', 'yes', 'yesterday', 'yet', 'yield', 'yields', 'you',
        'young', 'younger', 'youngest', 'your', 'yours', 'yourself',
        'yourselves', 'youth', 'youths', 'zero', 'zeros', 'zone', 'zones',
    ]
    
    wordlist_map = {
        'common': common_dirs,
        'medium': medium_dirs,
        'large': large_dirs[:10000],
        'extensive': large_dirs,
    }
    
    words = wordlist_map.get(wordlist, common_dirs)
    
    # Try using gobuster if available
    try:
        result = subprocess.run(
            ['gobuster', 'dir', '-u', url, '-w', '/dev/stdin', '-q', '--no-error'],
            input='\n'.join(words),
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.strip() and 'Status' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        path = parts[0]
                        status = int(parts[2])
                        size = int(parts[-1]) if parts[-1].isdigit() else None
                        results.append({
                            'path': path,
                            'status': status,
                            'size': size,
                            'found': True
                        })
            return results
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Try using dirb if available
    try:
        # dirb needs a wordlist file, so we'll use requests directly
        pass
    except:
        pass
    
    # Fallback: Use requests directly
    import random
    test_words = random.sample(words, min(100, len(words)))
    
    for word in test_words:
        try:
            test_url = urljoin(url.rstrip('/') + '/', word)
            response = requests.get(test_url, timeout=5, allow_redirects=False)
            
            if response.status_code in [200, 301, 302, 403]:
                results.append({
                    'path': word,
                    'status': response.status_code,
                    'size': len(response.content),
                    'found': True
                })
        except:
            pass
        
        # Rate limiting
        import time
        time.sleep(0.1)
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'URL required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    wordlist = sys.argv[2] if len(sys.argv) > 2 else 'common'
    
    results = bruteforce_directories(url, wordlist)
    print(json.dumps({'success': True, 'results': results}))

