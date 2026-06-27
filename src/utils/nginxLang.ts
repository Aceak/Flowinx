// ====== Nginx 语法高亮 (CodeMirror StreamLanguage) ======
import { StreamLanguage, StringStream } from '@codemirror/language';

const nginxKeywords = [
  'server', 'location', 'upstream', 'http', 'events', 'stream', 'mail',
  'listen', 'server_name', 'root', 'index', 'alias', 'try_files',
  'proxy_pass', 'proxy_set_header', 'proxy_redirect', 'proxy_read_timeout',
  'proxy_connect_timeout', 'proxy_send_timeout', 'proxy_buffering',
  'proxy_buffer_size', 'proxy_buffers', 'proxy_busy_buffers_size',
  'fastcgi_pass', 'fastcgi_param', 'uwsgi_pass', 'scgi_pass',
  'return', 'rewrite', 'if', 'set', 'map', 'geo', 'limit_except',
  'allow', 'deny', 'auth_basic', 'auth_basic_user_file',
  'ssl_certificate', 'ssl_certificate_key', 'ssl_protocols', 'ssl_ciphers',
  'ssl_prefer_server_ciphers', 'ssl_session_cache', 'ssl_session_timeout',
  'add_header', 'expires', 'autoindex', 'sendfile', 'tcp_nopush',
  'gzip', 'gzip_types', 'gzip_min_length', 'gzip_comp_level',
  'keepalive_timeout', 'keepalive_requests', 'keepalive',
  'client_max_body_size', 'client_body_buffer_size',
  'worker_processes', 'worker_connections', 'worker_rlimit_nofile',
  'error_log', 'access_log', 'log_format', 'pid', 'user',
  'include', 'default_type', 'types', 'charset', 'charset_types',
  'error_page', 'resolver', 'resolver_timeout',
  'limit_req', 'limit_req_zone', 'limit_conn', 'limit_conn_zone',
  'least_conn', 'ip_hash', 'random', 'hash', 'weight',
  'max_fails', 'fail_timeout', 'max_conns', 'backup', 'down',
  'last', 'break', 'redirect', 'permanent',
  'on', 'off', 'always',
  'Strict-Transport-Security',
  'X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection',
  'Content-Security-Policy', 'Referrer-Policy',
];

const nginxLanguage = StreamLanguage.define({
  name: 'nginx',
  startState: () => ({ inString: false, stringChar: '' }),

  token(stream: StringStream, state: { inString: boolean; stringChar: string }) {
    // 字符串
    if (state.inString) {
      while (!stream.eol()) {
        if (stream.match(state.stringChar)) {
          state.inString = false;
          return 'string';
        }
        stream.next();
      }
      return 'string';
    }

    // 注释
    if (stream.match('#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // 变量
    if (stream.match('$')) {
      stream.eatWhile(/[\w_]/);
      return 'variableName';
    }

    // 字符串引号
    if (stream.match(/["']/)) {
      state.inString = true;
      state.stringChar = stream.current();
      return 'string';
    }

    // 数字
    if (stream.match(/[0-9]+/)) {
      return 'number';
    }

    // 关键字/标识符
    if (stream.match(/[a-zA-Z_][\w_]*/)) {
      const word = stream.current();
      if (nginxKeywords.includes(word)) {
        return 'keyword';
      }
      return 'variableName';
    }

    // 括号和分号
    if (stream.match(/[{}().,;]/)) {
      return 'bracket';
    }

    // 跳过空白
    if (stream.eatSpace()) return null;

    // 其他
    stream.next();
    return null;
  },
});

export { nginxLanguage };
