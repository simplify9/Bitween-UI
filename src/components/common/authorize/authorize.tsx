import React from "react";
import {useTypedSelector} from "src/state/ReduxSotre";

type Props = {
    roles: Array<"Admin" | "Member" | "Viewer">
    children: JSX.Element
}
const Authorize: React.FC<Props> = ({roles, children}) => {

    const role = useTypedSelector(i => i.user.userInfo?.role)

    // @ts-ignore
    return roles.includes(role) ? children : <section disabled>{children}</section>
}
export default Authorize