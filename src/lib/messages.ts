/** Сообщения интерфейса — семейный портал (русский) */

export const msg = {
  loading: "Загрузка...",
  dash: "—",
  user: "Гость",

  secureAccess: "Добро пожаловать домой",
  homelab: "Семейный портал",
  enterCredentials: "Войдите, чтобы открыть наши общие пространства",
  name: "Ваше имя",
  enterName: "Как вас зовут?",
  totpCode: "Код из приложения",
  scanAuthenticator: "Отсканируйте QR-код в Google Authenticator",
  totpQrAlt: "QR-код для входа",
  verifying: "Проверяем...",
  continue: "Продолжить",
  authenticate: "Войти",
  signOut: "Выйти",

  tooManyAttempts: "Слишком много попыток. Подождите немного и попробуйте снова.",
  nameRequired: "Пожалуйста, напишите своё имя.",
  accessDenied: "К сожалению, вход только для членов семьи.",
  invalidTotp: "Неверный код. Проверьте время на телефоне и попробуйте снова.",
  serviceUnavailable: "Сервис временно недоступен. Попробуйте через несколько минут.",
  somethingWentWrong: "Что-то пошло не так. Попробуйте ещё раз.",
  unauthorized: "Сначала войдите в портал.",
  forbidden: "У вас нет доступа к этому разделу.",
  pathRequired: "Не удалось найти нужный файл.",
  fileNotFound: "Файл не найден. Возможно, он был удалён.",
  cannotDownloadDir: "Папки нельзя скачать — выберите отдельный файл.",
  noFileProvided: "Выберите файл для загрузки.",
  fileOperationFailed: "Не удалось выполнить операцию с файлом.",
  metricsUnavailable: "Данные пока недоступны. Обновите страницу.",
  backupFailed: "Не удалось сохранить копию. Попробуйте позже.",

  overview: "Главная",
  files: "Файлы",
  monitoring: "Мониторинг",
  backupLab: "Бэкапы",

  dashboardEyebrow: "Для всей семьи",
  dashboardTitle: "Ваш уютный дом в сети.",
  dashboardDescription:
    "Личные файлы и всё необходимое — в одном тёплом пространстве.",
  openSection: "Открыть",
  filesEyebrow: "Личное",
  adminEyebrow: "Управление",

  filesDesc: "Ваши личные файлы и фотографии — только для вас.",
  filesDescLong: "Загружайте, просматривайте и храните файлы в своём личном пространстве.",
  monitoringDesc: "Состояние домашнего сервера.",
  monitoringDescLong: "Нагрузка, память и диск в реальном времени.",
  backupDesc: "Резервные копии данных.",
  backupDescLong: "Управление резервным копированием базы и файлов.",

  downloadApp: "Приложение",
  downloadAppEyebrow: "На телефон",
  downloadAppDesc:
    "Установите портал на телефон — Android через APK, iPhone через экран «Домой».",
  downloadAndroid: "Android",
  downloadAndroidSub: "Скачайте APK и установите на телефон.",
  downloadApkButton: "Скачать APK",
  downloadApkPending:
    "APK скоро появится здесь. Соберите его через GitHub Actions или укажите NEXT_PUBLIC_APK_URL.",
  downloadHowToInstall: "Как установить",
  downloadAndroidStep1: "Скачайте файл APK на телефон.",
  downloadAndroidStep2:
    "Разрешите установку из неизвестных источников (Настройки → Безопасность).",
  downloadAndroidStep3: "Откройте файл и подтвердите установку.",
  downloadIos: "iPhone / iPad",
  downloadIosSub: "Добавьте портал на главный экран — как обычное приложение.",
  downloadIosShow: "Как установить на iOS",
  downloadIosHide: "Скрыть инструкцию",
  iosStepSafari: "Откройте портал в Safari (не в другом браузере).",
  iosStepShare: "Нажмите «Поделиться» внизу экрана.",
  iosStepHome: "Выберите «На экран Домой» и подтвердите.",
  iosInstallNote: "После этого иконка появится рядом с другими приложениями.",

  root: "Мои файлы",
  grid: "Карточки",
  list: "Список",
  upload: "Добавить",
  uploading: "Добавляем...",
  uploadTap: "Нажмите или перетащите файлы",
  uploadSuccess: "Готово",
  dragDrop: "Перетащите файлы сюда",
  download: "Скачать",
  delete: "Удалить",
  deleteConfirm: "Удалить этот элемент?",

  module02: "Сервер",
  module04: "Данные",
  cpu: "Процессор",
  memory: "Память",
  storage: "Диск",
  cpuHistory: "Нагрузка",
  systemDetails: "Подробности",
  uptime: "Время работы",
  memoryUsed: "Память",
  diskUsed: "Диск",
  overallStatus: "Общий статус",
  schedule: "Расписание",
  database: "База данных",
  privateCloud: "Файлы",
  noBackupsYet: "Резервных копий пока нет",
  runningBackup: "Создание копии...",
  triggerBackup: "Запустить копирование",
  backupHistory: "История",
  noBackupEvents: "Событий пока нет",
  healthy: "всё хорошо",
  idle: "ожидание",
  warning: "внимание",
  LOGIN: "Вход",
  BACKUP_START: "Начало копирования",
  BACKUP_SUCCESS: "Копирование успешно",
  BACKUP_FAIL: "Ошибка копирования",
  FILE_UPLOAD: "Загрузка файла",
  FILE_DELETE: "Удаление файла",
  FILE_DOWNLOAD: "Скачивание файла",
} as const;

export const internalError = {
  invalidPath: "__INVALID_PATH__",
  pathTraversal: "__PATH_TRAVERSAL__",
  symlinkEscape: "__SYMLINK_ESCAPE__",
} as const;

const INTERNAL_ERROR_MAP: Record<string, string> = {
  [internalError.invalidPath]: msg.fileOperationFailed,
  [internalError.pathTraversal]: msg.fileOperationFailed,
  [internalError.symlinkEscape]: msg.fileOperationFailed,
  [msg.unauthorized]: msg.unauthorized,
  [msg.forbidden]: msg.forbidden,
};

const USER_FACING = new Set(Object.values(msg));

function isNextInternalSignal(error: Error): boolean {
  // Next.js throws control-flow "errors" internally (e.g. DYNAMIC_SERVER_USAGE
  // when a route calls cookies()/headers() during static-generation probing).
  // These aren't application failures and shouldn't be logged as such.
  return (error as { digest?: string }).digest?.startsWith("DYNAMIC_SERVER_USAGE") ?? false;
}

export function toUserError(error: unknown): string {
  if (error instanceof Error) {
    if (isNextInternalSignal(error)) {
      return msg.somethingWentWrong;
    }
    const mapped = INTERNAL_ERROR_MAP[error.message];
    if (mapped) {
      // Routine unauthenticated/forbidden access isn't worth logging on every
      // request, but path-traversal/invalid-path attempts are security-relevant.
      if (mapped !== msg.unauthorized && mapped !== msg.forbidden) {
        console.error("[api] security-relevant error:", error.message);
      }
      return mapped;
    }
    if (USER_FACING.has(error.message as (typeof msg)[keyof typeof msg])) {
      return error.message;
    }
    if (looksTechnical(error.message)) {
      console.error("[api] technical error:", error);
      return msg.serviceUnavailable;
    }
    console.error("[api] unexpected error:", error);
    return msg.somethingWentWrong;
  }
  console.error("[api] non-Error thrown:", error);
  return msg.somethingWentWrong;
}

function looksTechnical(message: string): boolean {
  return /ECONNREFUSED|ECONNRESET|ETIMEDOUT|postgres|postgresql|docker|DATABASE_URL|ENOENT|EACCES|sql|syntax error|connection|redis|\/api\/|\.ts:|AggregateError|connect/i.test(
    message
  );
}

export function auditActionLabel(action: string): string {
  return (msg as Record<string, string>)[action] ?? action;
}

export function overallStatusLabel(status: string | undefined): string {
  if (!status) return msg.dash;
  if (status === "healthy") return msg.healthy;
  if (status === "idle") return msg.idle;
  return status;
}

export function apiErrorStatus(message: string): number {
  if (message === msg.unauthorized) return 401;
  if (message === msg.forbidden) return 403;
  return 400;
}
