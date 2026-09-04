import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'hero-ghost'
export type ButtonSize = 'default' | 'small'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Layout classes belonging to the surrounding page, not to the button. */
  className?: string
}

/**
 * The class string for a button-shaped thing. Links and anchors need this
 * rather than the component below — making one component swallow `<button>`,
 * `<a>` and `<Link>` costs a polymorphic `as` prop and its type gymnastics,
 * which is more machinery than three call sites are worth.
 */
export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'default',
  className?: string,
): string {
  return [
    'button',
    `button-${variant}`,
    size === 'small' ? 'button-small' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Every real button in the app. Before this the variant lived in a hand-typed
 * "button button-secondary button-small" in fifty-odd places, so a rename in
 * globals.css had to be found by grep and nothing failed if it was missed.
 *
 * `type` defaults to "button": these sit inside forms and cards where the HTML
 * default of "submit" is almost never what is wanted.
 */
export function Button({
  variant = 'secondary',
  size = 'default',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} type={type} {...rest} />
}
