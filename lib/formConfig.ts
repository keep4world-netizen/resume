export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "radio" | "checks" | "jdate" | "photo" | "select";
  options?: string[];
  required?: boolean;
  ltr?: boolean;
  showIf?: (v: any) => boolean;
};
export type Table = { name: string; title: string; rows: number; cols: Field[] };
export type ListBlock = { name: string; title: string; count: number };
export type Step = {
  title: string;
  fields?: Field[];
  tables?: Table[];
  list?: ListBlock;
};

const yesNo = ["بلی", "خیر"];

export const steps: Step[] = [
  {
    title: "مشخصات متقاضی",
    fields: [
      { name: "firstName", label: "نام", required: true },
      { name: "lastName", label: "نام خانوادگی", required: true },
      { name: "fatherName", label: "نام پدر" },
      { name: "nationalCode", label: "کد ملی", required: true, ltr: true },
      { name: "idNumber", label: "شماره شناسنامه", ltr: true },
      { name: "issuePlace", label: "محل صدور" },
      { name: "birthDate", label: "تاریخ تولد", type: "jdate" },
      { name: "birthPlace", label: "محل تولد" },
      { name: "gender", label: "جنسیت", type: "radio", options: ["مرد", "زن"] },
      { name: "phone", label: "شماره تلفن همراه", required: true, ltr: true },
      { name: "landline", label: "شماره تلفن ثابت", ltr: true },
      { name: "knownFrom", label: "طریقه آشنایی با شرکت" },
      { name: "photoUrl", label: "عکس پرسنلی (اختیاری)", type: "photo" },
    ],
  },
  {
    title: "وضعیت شخصی",
    fields: [
      {
        name: "military",
        label: "وضعیت نظام وظیفه",
        type: "radio",
        options: ["پایان خدمت", "معاف دائم", "معافیت پزشکی", "سایر معافیت‌ها"],
      },
      { name: "militaryOther", label: "علت معافیت", showIf: (v) => v.military === "سایر معافیت‌ها" },
      { name: "criminal", label: "سوء پیشینه", type: "radio", options: ["ندارد", "دارد"] },
      { name: "criminalDesc", label: "شرح سوء پیشینه", type: "textarea", showIf: (v) => v.criminal === "دارد" },
      { name: "marital", label: "وضعیت تأهل", type: "radio", options: ["مجرد", "متأهل"] },
      { name: "children", label: "تعداد فرزندان", type: "number", showIf: (v) => v.marital === "متأهل" },
      { name: "head", label: "سرپرست خانوار", type: "radio", options: ["هستم", "نیستم"] },
      { name: "dependents", label: "تعداد افراد تحت تکفل", type: "number" },
      { name: "spouseName", label: "نام و نام خانوادگی همسر", showIf: (v) => v.marital === "متأهل" },
      { name: "spouseJob", label: "شغل همسر", showIf: (v) => v.marital === "متأهل" },
      { name: "fatherJob", label: "شغل پدر" },
    ],
  },
  {
    title: "وضعیت جسمانی و بیمه",
    fields: [
      { name: "height", label: "قد (سانتی‌متر)", type: "number" },
      { name: "weight", label: "وزن (کیلوگرم)", type: "number" },
      { name: "health", label: "وضعیت جسمانی", type: "radio", options: ["سالم", "معلول"] },
      { name: "disability", label: "نوع معلولیت", showIf: (v) => v.health === "معلول" },
      { name: "insured", label: "سابقه بیمه", type: "radio", options: ["ندارد", "دارد"] },
      { name: "insuranceType", label: "نوع بیمه", showIf: (v) => v.insured === "دارد" },
      { name: "insuranceDays", label: "سابقه بیمه (روز)", type: "number", showIf: (v) => v.insured === "دارد" },
      { name: "insuranceNumber", label: "شماره بیمه", ltr: true, showIf: (v) => v.insured === "دارد" },
      { name: "unemployment", label: "مشمول بیمه بیکاری هستید؟", type: "radio", options: yesNo },
      { name: "unempFrom", label: "شروع مستمری از تاریخ", type: "jdate", showIf: (v) => v.unemployment === "بلی" },
      { name: "unempTo", label: "خاتمه مستمری در تاریخ", type: "jdate", showIf: (v) => v.unemployment === "بلی" },
    ],
  },
  {
    title: "تحصیلات",
    fields: [
      {
        name: "eduLevel",
        label: "وضعیت تحصیلی",
        type: "radio",
        options: ["پایان راهنمایی", "دیپلم", "کاردانی", "کارشناسی", "کارشناسی ارشد", "دکترا"],
      },
    ],
    tables: [
      {
        name: "education",
        title: "سوابق تحصیلی",
        rows: 2,
        cols: [
          { name: "degree", label: "نوع مدرک تحصیلی" },
          { name: "field", label: "رشته و گرایش" },
          { name: "school", label: "نام محل تحصیل" },
          { name: "province", label: "استان محل تحصیل" },
          { name: "year", label: "سال اخذ", ltr: true },
          { name: "gpa", label: "معدل", ltr: true },
        ],
      },
    ],
  },
  {
    title: "مهارت‌ها و دوره‌های گذرانده‌شده",
    tables: [
      {
        name: "skills",
        title: "مهارت‌ها / دوره‌ها",
        rows: 4,
        cols: [
          { name: "type", label: "نوع مهارت" },
          { name: "level", label: "درجه مهارت" },
          { name: "duration", label: "مدت دوره" },
          {
            name: "place",
            label: "نوع فراگیری",
            type: "select",
            options: ["مرکز فنی و حرفه‌ای", "آموزشگاه آزاد", "تجربه‌ای"],
          },
        ],
      },
    ],
  },
  {
    title: "سوابق کاری",
    tables: [
      {
        name: "work",
        title: "سوابق کاری (از آخرین سابقه شروع کنید)",
        rows: 3,
        cols: [
          { name: "company", label: "نام مؤسسه و تلفن" },
          { name: "activity", label: "نوع فعالیت مؤسسه" },
          { name: "title", label: "عنوان شغل" },
          { name: "salary", label: "حقوق دریافتی", ltr: true },
          { name: "from", label: "از (شمسی)", ltr: true },
          { name: "to", label: "تا (شمسی)", ltr: true },
          { name: "supervisor", label: "نام و تلفن سرپرست مستقیم" },
          { name: "leaveReason", label: "علت ترک کار" },
        ],
      },
    ],
  },
  {
    title: "شغل مورد علاقه و شرایط کاری",
    fields: [
      { name: "interest", label: "در خصوص مشاغل مورد علاقه خود توضیح دهید", type: "textarea" },
      { name: "employed", label: "آیا در حال حاضر شاغل هستید؟", type: "radio", options: yesNo },
      { name: "unemployedFor", label: "چه مدت بیکار هستید؟", showIf: (v) => v.employed === "خیر" },
      { name: "workAddress", label: "آدرس و مشخصات محل کار", showIf: (v) => v.employed === "بلی" },
      { name: "changeReason", label: "به چه دلیل تمایل به تغییر شغل دارید؟", showIf: (v) => v.employed === "بلی" },
      {
        name: "shifts",
        label: "ساعات کار مورد نظر",
        type: "checks",
        options: ["وقت اداری", "فقط عصرها", "فقط شب", "سه شیفت", "پاره وقت", "در طول روز", "فرقی نمی‌کند"],
      },
      { name: "trainee", label: "آیا علاقمند به شرکت در دوره‌های کارآموزی هستید؟", type: "radio", options: yesNo },
    ],
    list: {
      name: "traineeCourses",
      title: "در چه دوره‌هایی؟ (به ترتیب اولویت)",
      count: 5,
    },
  },
  {
    title: "آدرس و تماس",
    fields: [
      { name: "province", label: "استان" },
      { name: "city", label: "شهرستان" },
      { name: "street", label: "خیابان" },
      { name: "alley", label: "کوچه" },
      { name: "plate", label: "پلاک", ltr: true },
      { name: "unit", label: "واحد", ltr: true },
      { name: "floor", label: "طبقه", ltr: true },
      { name: "postal", label: "کد پستی ده رقمی", ltr: true },
      { name: "homePhone", label: "تلفن", ltr: true },
      { name: "email", label: "پست الکترونیکی", ltr: true },
    ],
  },
  {
    title: "تماس ضروری و معرف‌ها",
    fields: [
      { name: "emName", label: "تماس ضروری: نام و نام خانوادگی یکی از بستگان" },
      { name: "emMobile", label: "تلفن همراه", ltr: true },
      { name: "emPhone", label: "تلفن ثابت", ltr: true },
      { name: "emWork", label: "آدرس و تلفن محل کار" },
    ],
    tables: [
      {
        name: "refs",
        title: "سه نفر از افرادی که شما را به طور کامل می‌شناسند",
        rows: 3,
        cols: [
          { name: "name", label: "نام و نام خانوادگی" },
          { name: "address", label: "آدرس" },
          { name: "phone", label: "شماره تماس", ltr: true },
          { name: "relation", label: "رابطه با متقاضی" },
        ],
      },
    ],
  },
];
