/*
 * LoginPage : page de connexion, panneau centré sur la surface secondaire.
 * Spec : LoginPage.spec.md. Décision : D-339.
 * Une erreur de connexion est un message global en haut du panneau, jamais une erreur de champ :
 * la page ne dit pas si l'identifiant existe.
 */
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Input, TextField as RACTextField } from "react-aria-components/TextField";
import { cx, nativeFocusRing } from "../../lib/cx";
import { useMessages } from "../../provider/SocleProvider";
import { CircleAlert, Eye, EyeOff } from "../../icons";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/IconButton/IconButton";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { Link } from "../../components/Link/Link";
import { TextInput } from "../../components/TextInput/TextInput";
import { FieldHelp, FieldLabel, fieldBox, fieldRoot } from "../../components/Field/Field";

/** Valeurs envoyées par le formulaire. `remember` vaut `false` sans la case. */
export interface LoginValues {
  identifier: string;
  password: string;
  remember: boolean;
}

/** Fournisseur d'identité externe (SSO) : un bouton au-dessus du formulaire. */
export interface LoginProvider {
  /** Libellé complet : « Continuer avec Exemple ». */
  label: string;
  icon?: ReactNode;
  onPress: () => void;
}

/** Résultat de `onSubmit` : rien si la connexion réussit, `{ error }` sinon. */
export type LoginResult = void | { error: string };

export interface LoginPageProps {
  /** Logo de l'app, au-dessus du titre. */
  logo?: ReactNode;
  /** Titre. Défaut : « Connexion ». */
  title?: string;
  /** Phrase sous le titre. */
  subtitle?: string;
  /** Libellé du champ identifiant. Défaut : « Adresse e-mail ou identifiant ». */
  identifierLabel?: string;
  /** Valeur de départ de l'identifiant (dernier compte utilisé). */
  defaultIdentifier?: string;
  /** Affiche la case « Se souvenir de moi ». */
  showRemember?: boolean;
  /** Lien « Mot de passe oublié ? » vers cette adresse. */
  forgotHref?: string;
  /** Action de « Mot de passe oublié ? » (sans `forgotHref`, le lien est un bouton). */
  onForgot?: () => void;
  /** Fournisseurs d'identité, au-dessus du formulaire, puis « ou ». */
  providers?: LoginProvider[];
  /** Connecte. Pendant l'attente, le bouton tourne ; `{ error }` ou une exception affichent un message global. */
  onSubmit: (values: LoginValues) => Promise<LoginResult>;
}

const page = "socle-box flex min-h-dvh items-center justify-center bg-surface-side px-4 py-8 font-sans text-md text-fg";
const panel = "flex w-full max-w-[464px] flex-col gap-6 rounded-lg border border-line bg-surface px-8 py-8 max-tablet:px-5 max-tablet:py-6";

function PasswordField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string | undefined }) {
  const m = useMessages();
  const [visible, setVisible] = useState(false);
  return (
    <RACTextField
      name="password"
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      isRequired
      value={value}
      onChange={onChange}
      {...(error ? { isInvalid: true } : {})}
      className={fieldRoot()}
    >
      <FieldLabel isRequired>{m.loginPassword}</FieldLabel>
      <div className="relative">
        <Input className={cx(fieldBox(), "h-(--row-h) pr-(--row-h) pl-2.5")} />
        <span className="absolute inset-y-0 right-0 flex w-(--row-h) items-center justify-center">
          <IconButton icon={visible ? <EyeOff /> : <Eye />} label={m.loginShowPassword} isSelected={visible} onChange={setVisible} tooltipPlacement="top" />
        </span>
      </div>
      <FieldHelp error={error} />
    </RACTextField>
  );
}

export function LoginPage({
  logo,
  title,
  subtitle,
  identifierLabel,
  defaultIdentifier = "",
  showRemember = false,
  forgotHref,
  onForgot,
  providers,
  onSubmit,
}: LoginPageProps) {
  const m = useMessages();
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [missing, setMissing] = useState<{ identifier?: boolean; password?: boolean }>({});
  const [pending, setPending] = useState(false);
  // `n` change à chaque échec : le focus revient sur le message même s'il est identique.
  const [failure, setFailure] = useState<{ text: string; n: number } | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (failure) alertRef.current?.focus();
  }, [failure]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const empty = { identifier: identifier.trim() === "", password: password === "" };
    if (empty.identifier || empty.password) {
      setMissing(empty);
      const first = empty.identifier ? "identifier" : "password";
      formRef.current?.querySelector<HTMLInputElement>(`input[name="${first}"]`)?.focus();
      return;
    }
    setMissing({});
    setFailure(null);
    setPending(true);
    let error: string | null = null;
    try {
      const result = await onSubmit({ identifier: identifier.trim(), password, remember });
      if (result && typeof result === "object" && "error" in result) error = result.error || m.loginFailed;
    } catch {
      error = m.loginFailed;
    }
    if (!mounted.current) return;
    setPending(false);
    if (error) setFailure((f) => ({ text: error, n: (f?.n ?? 0) + 1 }));
  };

  const hasForgot = forgotHref !== undefined || onForgot !== undefined;
  return (
    <main className={page}>
      <section aria-labelledby={titleId} className={panel}>
        <header className="flex flex-col items-center gap-3 text-center">
          {logo && <div className="flex max-h-12 items-center justify-center">{logo}</div>}
          <div>
            <h1 id={titleId} className="m-0 text-xl leading-[1.3] font-heading [overflow-wrap:anywhere]">
              {title ?? m.loginTitle}
            </h1>
            {subtitle && <p className="mt-1 mb-0 text-fg-2">{subtitle}</p>}
          </div>
        </header>

        {failure && (
          <div
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className={"flex items-start gap-2 rounded-md border border-[color-mix(in_srgb,var(--danger)_45%,var(--line))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-3 py-2.5 text-fg " + nativeFocusRing}
          >
            <span className="mt-0.5 text-danger">
              <CircleAlert />
            </span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{failure.text}</span>
          </div>
        )}

        {providers && providers.length > 0 && (
          <div className="flex flex-col gap-4">
            <div role="group" aria-label={m.loginProviders} className="flex flex-col gap-2 [&>button]:w-full">
              {providers.map((p) => (
                <Button key={p.label} icon={p.icon} onPress={p.onPress} isDisabled={pending}>
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-fg-3" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              {m.loginOr}
              <span className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

        <form ref={formRef} noValidate onSubmit={submit} aria-labelledby={titleId} aria-busy={pending || undefined} className="flex flex-col gap-4">
          <TextInput
            name="identifier"
            label={identifierLabel ?? m.loginIdentifier}
            autoComplete="username"
            isRequired
            value={identifier}
            onChange={(v) => {
              setIdentifier(v);
              if (missing.identifier) setMissing((s) => ({ ...s, identifier: false }));
            }}
            {...(missing.identifier ? { error: m.loginIdentifierMissing } : {})}
          />
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (missing.password) setMissing((s) => ({ ...s, password: false }));
            }}
            error={missing.password ? m.loginPasswordMissing : undefined}
          />
          {(showRemember || hasForgot) && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {showRemember ? (
                <Checkbox name="remember" isSelected={remember} onChange={setRemember}>
                  {m.loginRemember}
                </Checkbox>
              ) : (
                <span />
              )}
              {hasForgot && (
                <span className="text-sm">
                  <Link {...(forgotHref !== undefined ? { href: forgotHref } : {})} {...(onForgot ? { onPress: onForgot } : {})}>
                    {m.loginForgot}
                  </Link>
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col [&>button]:w-full">
            <Button type="submit" variant="primary" isPending={pending}>
              {m.loginSubmit}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
