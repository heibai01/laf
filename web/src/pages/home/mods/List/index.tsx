import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiCodeBoxFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import CopyText from "@/components/CopyText";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import { Pages } from "@/constants";
import { APP_PHASE_STATUS } from "@/constants/index";
import { formatDate } from "@/utils/format";
import getRegionById from "@/utils/getRegionById";

import CreateAppModal from "../CreateAppModal";
import StatusBadge from "../StatusBadge";

import BundleInfo from "./BundleInfo";

import { SubscriptionControllerRemove } from "@/apis/v1/subscriptions";
import useGlobalStore from "@/pages/globalStore";

function List(props: { appListQuery: any; setShouldRefetch: any }) {
  const navigate = useNavigate();

  const { setCurrentApp, updateCurrentApp, regions } = useGlobalStore();

  const [searchKey, setSearchKey] = useState("");

  const { appListQuery, setShouldRefetch } = props;
  const bg = useColorModeValue("lafWhite.200", "lafDark.200");

  const deleteAppMutation = useMutation((params: any) => SubscriptionControllerRemove(params), {
    onSuccess: () => {
      setShouldRefetch(true);
    },
    onError: () => {},
  });

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-2xl flex items-center">
          <FileTypeIcon type="app" className="mr-1 " />
          {t("HomePanel.MyApp")}
        </h2>
        <div className="flex">
          <InputGroup className="mr-4">
            <InputLeftElement
              height={"8"}
              left="2"
              pointerEvents="none"
              children={<Search2Icon color="gray.300" fontSize={12} />}
            />
            <Input
              rounded={"full"}
              placeholder={t("Search").toString()}
              variant="outline"
              size={"sm"}
              onChange={(e: any) => setSearchKey(e.target.value)}
            />
          </InputGroup>
          <CreateAppModal>
            <Button colorScheme="primary" style={{ padding: "0 40px" }} leftIcon={<AddIcon />}>
              {t("Create")}
            </Button>
          </CreateAppModal>
        </div>
      </div>

      <div className="flex flex-col overflow-auto">
        <Box bg={bg} className="flex-none flex rounded-lg h-12 items-center px-6 mb-3">
          <div className="w-2/12 text-second ">{t("HomePanel.Application") + t("Name")}</div>
          <div className="w-2/12 text-second ">App ID</div>
          <div className="w-2/12 text-second pl-2">{t("HomePanel.State")}</div>
          <div className="w-2/12 text-second ">{t("HomePanel.Region")}</div>
          <div className="w-3/12 text-second ">{t("Time")}</div>
          <div className="w-1/12 text-second pl-2 min-w-[100px]">{t("Operation")}</div>
        </Box>
        <div className="flex-grow overflow-auto">
          {(appListQuery.data?.data || [])
            .filter((item: any) => item?.name.indexOf(searchKey) >= 0)
            .map((item: any) => {
              return (
                <Box
                  key={item?.appid}
                  bg={bg}
                  className="flex rounded-lg h-16 items-center px-6 mb-3"
                >
                  <div className="w-2/12 ">
                    <div className="font-bold text-lg">
                      {item?.name}
                      <span className="text-base text-second ml-2 border px-1 rounded">
                        {item?.bundle?.displayName}
                      </span>
                    </div>
                    <BundleInfo bundle={item.bundle} />
                  </div>
                  <div className="w-2/12 ">
                    {item?.appid} <CopyText text={item?.appid} />
                  </div>
                  <div className="w-2/12 ">
                    <StatusBadge statusConditions={item?.phase} state={item?.state} />
                  </div>
                  <div className="w-2/12 ">
                    {getRegionById(regions, item.regionId)?.displayName}
                  </div>
                  <div className="w-3/12 ">
                    创建时间: {formatDate(item.createdAt)} <br />
                    到期时间: {formatDate(item.subscription.expiredAt)} <a href="/renew">续期</a>
                  </div>
                  <div className="w-1/12 flex min-w-[100px]">
                    <Button
                      className="mr-2"
                      fontWeight={"semibold"}
                      size={"sm"}
                      variant={"text"}
                      disabled={item?.phase === APP_PHASE_STATUS.Deleting}
                      onClick={(event: any) => {
                        event?.preventDefault();
                        setCurrentApp(item);
                        navigate(`/app/${item?.appid}/${Pages.function}`);
                      }}
                    >
                      <RiCodeBoxFill size={25} className="mr-2" />
                      {t("HomePanel.Develop")}
                    </Button>
                    <Menu placement="bottom-end">
                      <MenuButton>
                        <IconWrap>
                          <BsThreeDotsVertical size={16} />
                        </IconWrap>
                      </MenuButton>
                      <MenuList width={12} minW={24}>
                        <CreateAppModal application={item}>
                          <MenuItem minH="40px" display={"block"}>
                            <a className="text-primary block" href="/edit">
                              {t("Edit")}
                            </a>
                          </MenuItem>
                        </CreateAppModal>

                        <MenuItem minH="40px" display={"block"}>
                          <a
                            className="text-primary block"
                            href="/restart"
                            onClick={(event) => {
                              event?.preventDefault();
                              updateCurrentApp(item);
                              setShouldRefetch(true);
                            }}
                          >
                            {t("SettingPanel.Restart")}
                          </a>
                        </MenuItem>

                        <MenuItem
                          minH="40px"
                          display={"block"}
                          onClick={(event: any) => {
                            event?.preventDefault();
                            updateCurrentApp(item, APP_PHASE_STATUS.Stopped);
                            setShouldRefetch(true);
                          }}
                        >
                          <a className="text-primary block" href="/stop">
                            {t("SettingPanel.Close")}
                          </a>
                        </MenuItem>

                        <ConfirmButton
                          headerText={t("HomePanel.DeleteApp")}
                          bodyText={t("HomePanel.DeleteTip")}
                          onSuccessAction={() => {
                            deleteAppMutation.mutate({
                              id: item.subscription.id,
                            });
                          }}
                        >
                          <MenuItem minH="40px" display={"block"}>
                            <a className="text-danger block" href="/delete">
                              {t("Delete")}
                            </a>
                          </MenuItem>
                        </ConfirmButton>
                      </MenuList>
                    </Menu>
                  </div>
                </Box>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default List;
