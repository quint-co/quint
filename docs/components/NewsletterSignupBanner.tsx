import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from './atomic-ui-elements/button'
import { Input } from './atomic-ui-elements/input'

export function NewsletterSignupBanner() {
  return (
    <div
      id="mc_embed_shell"
      className="
        relative
        p-12
        grid
        md:grid-cols-2
        gap-12
        items-center
        mt-6
      "
    >
      <div className="flex flex-col gap-3 items-start">
        <h1
          className="
            text-2xl
            font-bold
            leading-tight
            text-inherit
            sm:text-5xl
            sm:leading-tight
            lg:text-6xl
            lg:leading-tight
            font-pj
          "
        >
          Quint
        </h1>

        <h2
          className="
            text-quint-purple
            text-lg
            text-balance
            font-bold
            leading-tight
            sm:text-2xl
            sm:leading-tight
            lg:text-3xl
            lg:leading-tight
            font-pj
          "
        >
          A modern and executable specification language
        </h2>
      </div>

      <form
        action="https://systems.us4.list-manage.com/subscribe/post?u=0f6ea1a79dbcc56e2f4c22ec8&amp;id=06adecf928&amp;v_id=9754&amp;f_id=0018d4edf0"
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        className="
          flex
          flex-col
          gap-3
          items-start
        "
        target="_blank"
        noValidate
      >
        <FontAwesomeIcon icon={faEnvelope} className="text-quint-purple text-6xl" />

        <p className="text-2xl">Subscribe to our newsletter for the latest updates&nbsp;and&nbsp;features</p>

        <div className="flex items-center gap-3 w-full">
          <label className="w-full">
            <span className="sr-only">First Name</span>
            <Input type="text" name="FNAME" id="mce-FNAME" placeholder="First Name" className="w-full" />
          </label>

          <label className="w-full">
            <span className="sr-only">Email Address</span>
            <Input type="email" name="EMAIL" id="mce-EMAIL" required className="w-full" placeholder="Email Address" />
          </label>
        </div>

        <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
          <input
            type="checkbox"
            id="gdpr_41607"
            name="gdpr[41607]"
            className="gdpr"
            value="Y"
            checked={true}
            onChange={() => {}}
          />
          <input type="text" name="b_0f6ea1a79dbcc56e2f4c22ec8_06adecf928" tabIndex={-1} value="" onChange={() => {}} />
          <input type="hidden" name="tags" value="8032881" onChange={() => {}} />
        </div>

        <Button
          type="submit"
          name="subscribe"
          id="mc-embedded-subscribe"
          variant="primary"
          className="w-full justify-center"
        >
          Subscribe
        </Button>
      </form>
    </div>
  )
}
